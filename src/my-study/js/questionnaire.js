class QuestionnaireManager {
    constructor(studyManager) {
        this.studyManager = studyManager;
        this.selectedRatings = {
            likelihood: null,
            appeal: null,
            colorfulness: null,
            complexity: null
        };
        
        this.initializeListeners();
        this.loadCurrentImage();
    }

    initializeListeners() {
        // Add click handlers for all rating buttons
        document.querySelectorAll('.rating-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleRating(e));
        });

        document.getElementById('nextButton').addEventListener('click', () => this.handleNext());
    }

    loadCurrentImage() {
        const imgPath = this.studyManager.getCurrentImagePath();
        document.getElementById('currentAd').src = imgPath;
    }

    handleRating(event) {
        const value = parseInt(event.target.dataset.value);
        const questionGroup = event.target.closest('.rating-scale');
        
        // Clear previous selection in this group
        questionGroup.querySelectorAll('.rating-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
        
        // Select new button
        event.target.classList.add('selected');
        
        // Store rating
        const questionType = questionGroup.dataset.type;
        this.selectedRatings[questionType] = value;
        
        // Enable next button if all ratings are completed
        this.checkEnableNext();
    }

    checkEnableNext() {
        const allRated = Object.values(this.selectedRatings).every(rating => rating !== null);
        document.getElementById('nextButton').disabled = !allRated;
    }

    handleNext() {
        const isComplete = this.studyManager.saveResponse(this.selectedRatings);
        
        if (isComplete) {
            // Move to next phase of study
            window.location.href = 'results.html';
        } else {
            // Reset for next image
            this.resetRatings();
            this.loadCurrentImage();
        }
    }

    resetRatings() {
        this.selectedRatings = {
            likelihood: null,
            appeal: null,
            colorfulness: null,
            complexity: null
        };
        
        document.querySelectorAll('.rating-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
        
        document.getElementById('nextButton').disabled = true;
    }
} 