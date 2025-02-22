document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('model-form');
    const runButton = document.getElementById('run-models');
    let isLoading = false;

    // Smooth scroll for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // Enhanced parameter section toggling
    const toggleParameters = (modelType) => {
        document.querySelectorAll('.params-container').forEach(container => {
            container.style.display = 'none';
            container.classList.remove('fade-in');
        });

        const selectedContainer = document.getElementById(`${modelType}-params`);
        if (selectedContainer) {
            selectedContainer.style.display = 'block';
            // Trigger reflow for animation
            void selectedContainer.offsetWidth;
            selectedContainer.classList.add('fade-in');
        }
    };

    document.querySelectorAll('input[name="model"]').forEach(radio => {
        radio.addEventListener('change', (e) => toggleParameters(e.target.value));
    });

    // Enhanced form validation
    const validateParams = (modelType, params) => {
        switch (modelType) {
            case 'decision_tree':
                if (params.max_depth && params.max_depth < 1) return false;
                if (params.min_samples_split && params.min_samples_split < 2) return false;
                break;
            case 'knn':
                if (params.n_neighbors && params.n_neighbors < 1) return false;
                break;
            case 'logistic_regression':
            case 'svm':
                if (params.C && params.C <= 0) return false;
                break;
        }
        return true;
    };

    // Enhanced parameter collection
    const collectParameters = (modelType) => {
        const params = {};

        switch (modelType) {
            case 'decision_tree':
                const maxDepth = document.getElementById('tree-max-depth').value;
                const minSamplesSplit = document.getElementById('tree-min-samples-split').value;
                if (maxDepth) params.max_depth = parseInt(maxDepth);
                if (minSamplesSplit) params.min_samples_split = parseInt(minSamplesSplit);
                break;

            case 'knn':
                const nNeighbors = document.getElementById('knn-n-neighbors').value;
                const weights = document.getElementById('knn-weights').value;
                if (nNeighbors) params.n_neighbors = parseInt(nNeighbors);
                if (weights) params.weights = weights;
                break;

            case 'logistic_regression':
                const lrC = document.getElementById('lr-c').value;
                if (lrC) params.C = parseFloat(lrC);
                break;

            case 'svm':
                const svmC = document.getElementById('svm-c').value;
                const kernel = document.getElementById('svm-kernel').value;
                if (svmC) params.C = parseFloat(svmC);
                if (kernel) params.kernel = kernel;
                break;
        }

        return params;
    };

    // Enhanced results update with animations
    const updateResults = (modelType, data) => {
        // Hide all cards first
        document.querySelectorAll('.result-card').forEach(card => {
            card.style.display = 'none';
            card.classList.remove('fade-in');
        });

        // Get correct card ID
        const cardId = modelType.includes('_') ?
            modelType.replace('_', '-') + '-card' :
            `${modelType}-card`;

        const resultsId = modelType.includes('_') ?
            modelType.replace('_', '-') + '-results' :
            `${modelType}-results`;

        const card = document.getElementById(cardId);
        const resultsElement = document.getElementById(resultsId);

        if (card && resultsElement) {
            // Show card with animation
            card.style.display = 'block';
            void card.offsetWidth; // Trigger reflow
            card.classList.add('fade-in');

            // Update metrics with staggered animation
            const metrics = [
                { label: 'Accuracy', value: data.accuracy },
                { label: 'F1 Score', value: data.f1_score },
                { label: 'Precision', value: data.precision },
                { label: 'Recall', value: data.recall },
                { label: 'CV Score', value: data.cv_score }
            ];

            resultsElement.innerHTML = metrics.map((metric, index) => `
                <div class="metric fade-in" style="animation-delay: ${index * 100}ms">
                    <span class="metric-label">${metric.label}</span>
                    <span class="metric-value">${(metric.value * 100).toFixed(2)}%</span>
                </div>
            `).join('');
        }
    };

    // Enhanced toast notifications
    const showToast = (message, type = 'success') => {
        const toastContainer = document.querySelector('.toast-container');
        const toastElement = document.createElement('div');
        toastElement.className = `toast align-items-center text-white bg-${type} border-0 fade-in`;
        toastElement.setAttribute('role', 'alert');
        toastElement.setAttribute('aria-live', 'assertive');
        toastElement.setAttribute('aria-atomic', 'true');

        toastElement.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        `;

        toastContainer.appendChild(toastElement);
        const toast = new bootstrap.Toast(toastElement);
        toast.show();

        // Remove toast after it's hidden
        toastElement.addEventListener('hidden.bs.toast', () => {
            toastElement.remove();
        });
    };

    // Enhanced form submission
    runButton.addEventListener('click', async() => {
        if (isLoading) return;

        try {
            const modelType = document.querySelector('input[name="model"]:checked').value;
            const params = collectParameters(modelType);

            if (!validateParams(modelType, params)) {
                showToast('Please check your parameter values', 'danger');
                return;
            }

            // Set loading state
            isLoading = true;
            runButton.disabled = true;
            runButton.innerHTML = `
                <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                Running...
            `;

            const response = await fetch('/run-model', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ model_type: modelType, params })
            });

            const data = await response.json();

            if (!response.ok || data.error) {
                throw new Error(data.error || 'Failed to run model');
            }

            updateResults(modelType, data);
            showToast('Model evaluation completed successfully!');

            // Smooth scroll to results section
            document.getElementById('model-results').scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });

        } catch (error) {
            console.error('Error:', error);
            showToast(error.message, 'danger');
        } finally {
            // Reset loading state
            isLoading = false;
            runButton.disabled = false;
            runButton.innerHTML = '<i class="fas fa-play me-2"></i>Run Model';
        }
    });

    // Initialize with default model parameters
    toggleParameters('decision_tree');
});