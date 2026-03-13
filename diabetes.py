from flask import Flask, render_template, jsonify, request
from sklearn.svm import SVC
from sklearn.tree import DecisionTreeClassifier
from sklearn.neighbors import KNeighborsClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score, f1_score, precision_score, recall_score,
    roc_auc_score, confusion_matrix, classification_report, roc_curve
)
from sklearn.model_selection import train_test_split, learning_curve
from sklearn.preprocessing import StandardScaler
import pandas as pd
import numpy as np
import os
import json

app = Flask(__name__)

# ─── In-memory model cache ────────────────────────────────────────────────────
_cache = {}   # { 'models': {}, 'scaler': ..., 'results': {}, 'dataset': {} }


# ─── Data Loading ─────────────────────────────────────────────────────────────
def load_data():
    current_dir = os.path.dirname(os.path.abspath(__file__))
    data_path = os.path.join(current_dir, 'static', 'diabetes.csv')
    if not os.path.exists(data_path):
        raise FileNotFoundError("diabetes.csv not found in static/")

    df = pd.read_csv(data_path)

    # Replace zero-values in physiological columns with column mean
    zero_cols = ['Glucose', 'BloodPressure', 'SkinThickness', 'Insulin', 'BMI']
    for col in zero_cols:
        df[col] = df[col].replace(0, df[col][df[col] != 0].mean())

    X = df[['Pregnancies', 'Glucose', 'BloodPressure', 'SkinThickness',
             'Insulin', 'BMI', 'DiabetesPedigreeFunction', 'Age']].values
    y = df['Outcome'].values
    return df, X, y


# ─── Train All Models ─────────────────────────────────────────────────────────
def train_all_models(test_size=0.2, hyperparams=None, selected_features=None):
    if hyperparams is None:
        hyperparams = {}

    df, X_full, y = load_data()

    ALL_FEAT = ['Pregnancies', 'Glucose', 'BloodPressure', 'SkinThickness',
                'Insulin', 'BMI', 'PedigreeFunc', 'Age']

    # Feature selection
    if selected_features and len(selected_features) >= 2:
        feat_idx   = [int(i) for i in selected_features]
        X          = X_full[:, feat_idx]
        feat_names = [ALL_FEAT[i] for i in feat_idx]
    else:
        X          = X_full
        feat_names = ALL_FEAT
        feat_idx   = list(range(len(ALL_FEAT)))

    scaler = StandardScaler()
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=test_size, random_state=42, stratify=y
    )
    X_train_s = scaler.fit_transform(X_train)
    X_test_s  = scaler.transform(X_test)

    svm_C    = float(hyperparams.get('svm_C',   1.0))
    knn_k    = int(  hyperparams.get('knn_k',   9))
    dt_depth = int(  hyperparams.get('dt_depth', 5))

    model_defs = {
        'svm': SVC(kernel='rbf', C=svm_C, gamma='scale', probability=True, random_state=42),
        'lr':  LogisticRegression(max_iter=1000, random_state=42),
        'knn': KNeighborsClassifier(n_neighbors=knn_k),
        'dt':  DecisionTreeClassifier(max_depth=dt_depth, random_state=42),
    }

    results = {}
    trained_models = {}

    for name, clf in model_defs.items():
        clf.fit(X_train_s, y_train)
        trained_models[name] = clf

        y_pred  = clf.predict(X_test_s)
        y_prob  = clf.predict_proba(X_test_s)[:, 1]

        train_acc = float(accuracy_score(y_train, clf.predict(X_train_s)))
        test_acc  = float(accuracy_score(y_test, y_pred))
        f1        = float(f1_score(y_test, y_pred))
        roc_auc   = float(roc_auc_score(y_test, y_prob))
        precision = float(precision_score(y_test, y_pred))
        recall    = float(recall_score(y_test, y_pred))
        cm        = confusion_matrix(y_test, y_pred).tolist()
        report    = classification_report(y_test, y_pred, output_dict=True)

        # ROC curve – downsample to ≤60 points for JSON size
        fpr_arr, tpr_arr, _ = roc_curve(y_test, y_prob)
        n = len(fpr_arr)
        if n > 60:
            idx = np.linspace(0, n - 1, 60, dtype=int)
            fpr_arr, tpr_arr = fpr_arr[idx], tpr_arr[idx]

        # Learning curve – 7 sizes, 5-fold CV
        sizes = np.linspace(0.1, 1.0, 7)
        lc_sizes, lc_train, lc_val = learning_curve(
            clf, X_train_s, y_train,
            train_sizes=sizes, cv=5, scoring='accuracy', n_jobs=-1
        )

        results[name] = {
            'train_acc': round(train_acc, 4),
            'test_acc':  round(test_acc, 4),
            'f1':        round(f1, 4),
            'roc_auc':   round(roc_auc, 4),
            'precision': round(precision, 4),
            'recall':    round(recall, 4),
            'cm':        cm,
            'report':    {k: {mk: round(mv, 4) if isinstance(mv, float) else mv
                              for mk, mv in v.items()}
                          if isinstance(v, dict) else round(v, 4)
                          for k, v in report.items()},
            'lc': {
                'sizes':        [int(s) for s in lc_sizes.tolist()],
                'train_scores': [round(float(v), 4) for v in np.mean(lc_train, axis=1)],
                'val_scores':   [round(float(v), 4) for v in np.mean(lc_val,   axis=1)],
            },
            'roc': {
                'fpr': [round(float(v), 4) for v in fpr_arr],
                'tpr': [round(float(v), 4) for v in tpr_arr],
            },
        }

    # Feature importance from LR coefficients (only active features)
    lr_coef  = np.abs(model_defs['lr'].coef_[0])
    feat_imp = (lr_coef / lr_coef.max()).tolist()

    d_mask, h_mask = y == 1, y == 0
    features = sorted([
        {
            'name': feat_names[i],
            'imp':  round(float(feat_imp[i]), 4),
            'dM':   round(float(X[d_mask, i].mean()), 3),
            'hM':   round(float(X[h_mask, i].mean()), 3),
        }
        for i in range(len(feat_names))
    ], key=lambda x: -x['imp'])

    dataset = {
        'n': int(len(df)),
        'n_diabetic': int(y.sum()),
        'n_healthy':  int(len(y) - y.sum()),
        'diabetic_rate': round(float(y.mean()), 4),
        'n_train': int(len(X_train)),
        'n_test':  int(len(X_test)),
        'feature_means': {feat_names[i]: round(float(X[:, i].mean()), 3)
                          for i in range(len(feat_names))},
        'hyperparams': {'svm_C': svm_C, 'knn_k': knn_k, 'dt_depth': dt_depth},
        'test_size': round(test_size, 2),
        'active_features': feat_names,
    }

    # Store in cache
    _cache['models']  = trained_models
    _cache['scaler']  = scaler
    _cache['results'] = results
    _cache['features'] = features
    _cache['dataset']  = dataset

    return results, features, dataset


# ─── Routes ───────────────────────────────────────────────────────────────────

@app.route('/')
def index():
    return render_template('index.html')


@app.route('/api/train', methods=['POST'])
def api_train():
    """Train all 4 models and return full metrics."""
    try:
        body             = request.get_json(silent=True) or {}
        test_size        = float(body.get('test_size', 0.2))
        hyperparams      = body.get('hyperparams', {})
        selected_features = body.get('features', None)
        results, features, dataset = train_all_models(test_size, hyperparams, selected_features)
        return jsonify({'results': results, 'features': features, 'dataset': dataset})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/predict', methods=['POST'])
def api_predict():
    """Run inference on all trained models for a single patient."""
    try:
        if 'models' not in _cache:
            return jsonify({'error': 'Models not trained yet. Call /api/train first.'}), 400

        data = request.get_json()
        vals = [float(data[k]) for k in
                ['pregnancies', 'glucose', 'bloodpressure', 'skinthickness',
                 'insulin', 'bmi', 'diabetespedigreefunction', 'age']]

        pt   = np.array(vals).reshape(1, -1)
        pt_s = _cache['scaler'].transform(pt)

        probs, preds = {}, {}
        for name, clf in _cache['models'].items():
            probs[name] = round(float(clf.predict_proba(pt_s)[0, 1]), 4)
            preds[name] = int(clf.predict(pt_s)[0])

        ensemble = round(float(np.mean(list(probs.values()))), 4)

        return jsonify({'probs': probs, 'preds': preds, 'ensemble': ensemble})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/results', methods=['GET'])
def api_results():
    """Return cached training results (if already trained)."""
    if 'results' not in _cache:
        return jsonify({'error': 'Not trained yet'}), 404
    return jsonify({
        'results':  _cache['results'],
        'features': _cache['features'],
        'dataset':  _cache['dataset'],
    })


# ─── Vercel handler ───────────────────────────────────────────────────────────
def handler(event, context):
    return app(event, context)


if __name__ == '__main__':
    app.run(debug=True)