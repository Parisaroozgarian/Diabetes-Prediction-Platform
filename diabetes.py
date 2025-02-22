from flask import Flask, render_template, jsonify, request
from flask_lambda import FlaskLambda
from sklearn.tree import DecisionTreeClassifier
from sklearn.neighbors import KNeighborsClassifier
from sklearn.linear_model import LogisticRegression
from sklearn import svm
from sklearn.metrics import accuracy_score, f1_score, precision_score, recall_score
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import StandardScaler
import pandas as pd
import numpy as np
import os

# Use FlaskLambda for Vercel compatibility
app = FlaskLambda(__name__)

def load_and_preprocess_data():
    """Load and preprocess the dataset"""
    try:
        # Use relative path to access diabetes.csv inside the 'static' folder
        current_dir = os.path.dirname(os.path.abspath(__file__))
        data_path = os.path.join(current_dir, 'static', 'diabetes.csv')

        if not os.path.exists(data_path):
            raise FileNotFoundError("Dataset file not found. Ensure 'diabetes.csv' is in the 'static/' directory.")

        data = pd.read_csv(data_path)

        # Handle missing values (0 values in certain columns)
        columns_to_fix = ['Glucose', 'BloodPressure', 'SkinThickness', 'Insulin', 'BMI']
        for column in columns_to_fix:
            data[column] = data[column].replace(0, data[column][data[column] != 0].mean())

        # Features and target
        x = data[['Pregnancies', 'Glucose', 'BloodPressure', 'SkinThickness',
                  'Insulin', 'BMI', 'DiabetesPedigreeFunction', 'Age']]
        y = data['Outcome']

        # Feature scaling
        scaler = StandardScaler()
        x_scaled = scaler.fit_transform(x)

        return train_test_split(x_scaled, y, test_size=0.2, random_state=42)
    except Exception as e:
        print(f"Error in data loading: {str(e)}")
        return None, None, None, None

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/run-model', methods=['POST'])
def run_model():
    try:
        # Load and preprocess data
        x_train, x_test, y_train, y_test = load_and_preprocess_data()
        if x_train is None:
            return jsonify({'error': 'Failed to load data. Ensure diabetes.csv is in the static/ folder.'}), 500

        data = request.get_json()
        model_type = data.get('model_type')
        params = data.get('params', {})

        # Initialize model based on type
        if model_type == 'decision_tree':
            max_depth = int(params.get('max_depth')) if params.get('max_depth') else None
            min_samples_split = int(params.get('min_samples_split', 2))
            clf = DecisionTreeClassifier(
                max_depth=max_depth,
                min_samples_split=min_samples_split,
                random_state=42
            )

        elif model_type == 'knn':
            n_neighbors = int(params.get('n_neighbors', 5))
            weights = params.get('weights', 'uniform')
            clf = KNeighborsClassifier(
                n_neighbors=n_neighbors,
                weights=weights
            )

        elif model_type == 'logistic_regression':
            C = float(params.get('C', 1.0))
            clf = LogisticRegression(
                C=C,
                max_iter=1000,
                random_state=42
            )

        elif model_type == 'svm':
            C = float(params.get('C', 1.0))
            kernel = params.get('kernel', 'rbf')
            clf = svm.SVC(
                C=C,
                kernel=kernel,
                random_state=42
            )

        else:
            return jsonify({'error': 'Invalid model type'}), 400

        # Train and evaluate model
        clf.fit(x_train, y_train)
        y_pred = clf.predict(x_test)

        # Calculate metrics
        metrics = {
            'accuracy': float(accuracy_score(y_test, y_pred)),
            'f1_score': float(f1_score(y_test, y_pred)),
            'precision': float(precision_score(y_test, y_pred)),
            'recall': float(recall_score(y_test, y_pred))
        }

        # Add cross-validation score
        cv_scores = cross_val_score(clf, x_train, y_train, cv=5)
        metrics['cv_score'] = float(cv_scores.mean())

        return jsonify(metrics)

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Required handler function for Vercel
def handler(event, context):
    return app(event, context)

# Main execution for local testing
if __name__ == '__main__':
    app.run(debug=True)
