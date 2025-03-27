/*************************************************************
 * Main code, responsible for configuring the steps and their
 * actions.
 *
 * Author: LITW Team.
 *
 * © Copyright 2017-2024 LabintheWild.
 * For questions about this file and permission to use
 * the code, contact us at tech@labinthewild.org
 *************************************************************/

// load webpack modules
window.LITW = window.LITW || {}
window.$ = require("jquery");
window.jQuery = window.$;
require("../js/jquery.i18n");
require("../js/jquery.i18n.messagestore");
require("jquery-ui-bundle");
let Handlebars = require("handlebars");
window.$.alpaca = require("alpaca");
window.bootstrap = require("bootstrap");
window._ = require("lodash");

import * as litw_engine from "../js/litw/litw.engine.0.1.0";
LITW.engine = litw_engine;

//LOAD THE HTML FOR STUDY PAGES
import progressHTML from "./pages/progress.html";
Handlebars.registerPartial('prog', Handlebars.compile(progressHTML));
import introHTML from "./pages/introduction.html";
import irb_LITW_HTML from "./pages/irb.html";
import demographicsHTML from "./pages/demographics.html";
import resultsHTML from "./pages/results.html";
import resultsFooterHTML from "../templates/results-footer.html";
import commentsHTML from "../templates/comments.html";
import adSurveyHTML from "./pages/adSurvey.html";
import finalQuestionsHTML from "./pages/finalQuestions.html";

//CONVERT HTML INTO TEMPLATES
let introTemplate = Handlebars.compile(introHTML);
let irbLITWTemplate = Handlebars.compile(irb_LITW_HTML);
let demographicsTemplate = Handlebars.compile(demographicsHTML);
let resultsTemplate = Handlebars.compile(resultsHTML);
let resultsFooterTemplate = Handlebars.compile(resultsFooterHTML);
let commentsTemplate = Handlebars.compile(commentsHTML);
let adSurveyTemplate = Handlebars.compile(adSurveyHTML);
let finalQuestionsTemplate = Handlebars.compile(finalQuestionsHTML);

// At the top level, add these variables
let currentImageIndex = 0;
const totalImagesToShow = 11;
let selectedImages = [];

// Create an array of the actual image filenames
const IMAGE_FILES = [
    "2101C1.jpg", "2101C2.jpg", "2101S1.jpg", "2102C2.jpg", "2102C2B.jpg",
    "2102S1.jpg", "2103C1.jpg", "2103S1.jpg", "2104C1.jpg", "2104C2.jpg",
    "2104S1.jpg", "2105C1B.jpg", "2105C2.jpg", "2105S.jpg", "2105S2.jpg",
    "2106S1.jpg", "2106S2.jpg", "2107C1.jpg", "2107S1.jpg", "2107S2.jpg",
    "2201C1.jpg", "2201C2.jpg", "2201S1.jpg", "2201S2.jpg", "2202S1.jpg",
    "2204C1.jpg", "2204C2.jpg", "2204S1.jpg", "2204S2.jpg", "2205C1.jpg",
    "2205S1.jpg", "2206C1.jpg", "2206S1.jpg", "2207C1.jpg", "2207S1.jpg",
    "2207S2.jpg", "2208C1.jpg", "2208S1.jpg", "2208S2.jpg", "2209C1.jpg",
    "2209S1.jpg", "2210C1.jpg", "2210C2.jpg", "2210S1.jpg", "2211C1.jpg",
    "2211S1.jpg", "2301C1.jpg", "2301C2.jpg", "2301S1.jpg", "2301S2.jpg",
    "2302C1.jpg", "2302S1.jpg", "2302S2.jpg", "2401C1.jpg", "2401C2.jpg",
    "2401S1.jpg", "2401S2.jpg", "2402C1.jpg", "2402S1.jpg", "2403C1.jpg",
    "2403C2B.jpg", "2403S1.jpg", "2404C1.jpg", "2404C2.jpg", "2404S1.jpg",
    "2404S2B.jpg", "2405C1.jpg", "2405C2.jpg", "2405S1.jpg", "2405S2.jpg",
    "2407C1.jpg", "2407C2.jpg", "2407S1.jpg", "2407S2.jpg", "2408S1.jpg",
    "2409C1.jpg", "2409C2B.jpg", "2409S1.jpg", "2409S2.jpg", "2410C1.jpg",
    "2410S1.jpg", "2501C1.jpg", "2501C2.jpg", "2501S1.jpg", "2501S2.jpg",
    "2502C1.jpg", "2502C2B.jpg", "2502S1.jpg", "2601C1.jpg", "2601C2.jpg",
    "2601S1.jpg", "2601S2.jpg", "2602C1.jpg", "2602C2.jpg", "2602S1.jpg",
    "2602S2.jpg", "2604C1.jpg", "2604C2.jpg", "2604S1B.jpg", "2604S2.jpg",
    "2701C1.jpg", "2701C2B.jpg", "2701S1.jpg", "2702C1.jpg", "2702S1.jpg"
];

function initializeImageSelection() {
	const allIndices = Array.from({length: IMAGE_FILES.length}, (_, i) => i);
	for (let i = allIndices.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[allIndices[i], allIndices[j]] = [allIndices[j], allIndices[i]];
	}
	selectedImages = allIndices.slice(0, totalImagesToShow);
}

let participantData = {
    demographics: {},
    responses: []
};

module.exports = (function(exports) {
	const study_times = {
			SHORT: 5,
			MEDIUM: 10,
			LONG: 15,
		};
	let timeline = [];
	let config = {
		languages: {
			'default': 'en',
			'en': './i18n/en.json?v=1.0',
			'pt': './i18n/pt-br.json?v=1.0',
		},
		study_id: "TO_BE_ADDED_IF_USING_LITW_INFRA",
		study_recommendation: [],
		preLoad: ["../img/btn-next.png","../img/btn-next-active.png","../img/ajax-loader.gif"],
		slides: {
			INTRODUCTION: {
				name: "introduction",
				type: LITW.engine.SLIDE_TYPE.SHOW_SLIDE,
				display_element_id: "intro",
				template: introTemplate,
				display_next_button: false,
			},
			INFORMED_CONSENT_LITW: {
				name: "informed_consent",
				type: LITW.engine.SLIDE_TYPE.SHOW_SLIDE,
				display_element_id: "irb",
				template: irbLITWTemplate,
				template_data: {
					time: study_times.SHORT,
				},
				display_next_button: false,
			},
			DEMOGRAPHICS: {
				name: "demographics",
				type: LITW.engine.SLIDE_TYPE.SHOW_SLIDE,
				display_element_id: "demographics",
				display_next_button: false,
				template: demographicsTemplate,
				template_data: {
					local_data_id: 'LITW_DEMOGRAPHICS'
				},
				finish: function() {
					let demographicData = $('#demographicsForm').alpaca().getValue();
					participantData.demographics = {
						age: demographicData["demographics-age"],
						gender: demographicData["demographics-gender"],
						country: demographicData["demographics-country-live"],
						language: demographicData["demographics-language-native"],
					};
					
					// console.log("...participantData.demographics: " + JSON.stringify(participantData.demographics));
					// LITW.data.submitStudyData({
					// 	dataType: "demographics",
					// 	...participantData.demographics
					// });
				}
			},
			
			AD_SURVEY: {
				name: "ad_survey",
				type: LITW.engine.SLIDE_TYPE.SHOW_SLIDE,
				display_element_id: "ad-survey",
				template: adSurveyTemplate,
				display_next_button: false,
				on_display: function() {
					if (typeof resetSelections === 'function') {
						resetSelections();
					}
					window.scrollTo(0, 0);
				},
				template_data: () => {
					return {
						progress: {
							current: currentImageIndex,
							total: totalImagesToShow,
							value: Math.round((currentImageIndex / totalImagesToShow) * 100)
						},
						currentImage: `./img/105-edited/${IMAGE_FILES[selectedImages[currentImageIndex]]}`,
					}
				},
				finish: function() {
					if (!window.selectionData.likelihood || 
						!window.selectionData.appeal || 
						!window.selectionData.creative ||
						!window.selectionData.weird) {
						return false;
					}

					participantData.responses.push({
						imageId: IMAGE_FILES[selectedImages[currentImageIndex]],
						likelihood: parseInt(window.selectionData.likelihood),
						appeal: parseInt(window.selectionData.appeal),
						creative: parseInt(window.selectionData.creative),
						weird: parseInt(window.selectionData.weird),
						timestamp: new Date().getTime()
					});

					currentImageIndex++;
					
					//if total images to show is reached, proceed to final questions
					if (currentImageIndex >= totalImagesToShow) {
						// console.log("...participantData.responses: " + JSON.stringify({
						// 	dataType: "finalData",
						// 	demographics: participantData.demographics,
						// 	imageRatings: participantData.responses
						// }));
						LITW.data.submitStudyData({
							dataType: "finalData",
							demographics: participantData.demographics,
							imageRatings: participantData.responses
						});
						// Instead of calling calculateResults(), show the final questions
						window.scrollTo(0, 0);
						LITW.utils.showSlide("final_questions");
					} else {
						window.scrollTo(0, 0);
						LITW.utils.showSlide("ad-survey");
					}
					return true;
				}
			},
			COMMENTS: {
				name: "comments",
				type: LITW.engine.SLIDE_TYPE.SHOW_SLIDE,
				display_element_id: "comments",
				display_next_button: true,
				template: commentsTemplate,
				finish: function(){
					let comments = $('#commentsForm').alpaca().getValue();
					if (Object.keys(comments).length > 0) {
						LITW.data.submitComments({
							comments: comments
						});
					}
				}
			},
			RESULTS: {
				name: "results",
				display_next_button: false,
				type: LITW.engine.SLIDE_TYPE.CALL_FUNCTION,
				call_fn: function(){
					window.scrollTo(0, 0);
					calculateResults();
				}
			},
			FINAL_QUESTIONS: {
				name: "final_questions",
				type: LITW.engine.SLIDE_TYPE.SHOW_SLIDE,
				display_element_id: "final_questions",
				template: finalQuestionsTemplate,
				display_next_button: false,
				on_display: function() {
					if (typeof resetSelections === 'function') {
						resetSelections();
					}
					window.scrollTo(0, 0);
				},
				finish: function() {
					if (!window.selectionData.ai_estimate || 
						!window.selectionData.ai_comfort || 
						!window.selectionData.ai_familiar) {
						return false;
					}

					// console.log("Submitting final questions data:", {
					// 	dataType: "finalQuestions",
					// 	ai_estimate: parseInt(window.selectionData.ai_estimate),
					// 	ai_comfort: parseInt(window.selectionData.ai_comfort),
					// 	ai_familiar: parseInt(window.selectionData.ai_familiar)
					// });

					LITW.data.submitStudyData({
						dataType: "finalQuestions",
						ai_estimate: parseInt(window.selectionData.ai_estimate),
						ai_comfort: parseInt(window.selectionData.ai_comfort),
						ai_familiar: parseInt(window.selectionData.ai_familiar)
					});
					
					calculateResults();
					return true;
				}
			}
		}
	};

	//configures timeline here; would be place to switch demographics
	function configureTimeline() {
		timeline.push(config.slides.INTRODUCTION);
		timeline.push(config.slides.INFORMED_CONSENT_LITW);
		timeline.push(config.slides.DEMOGRAPHICS);

		for (let i = 0; i < totalImagesToShow; i++) {
			timeline.push(config.slides.AD_SURVEY);
		}

		timeline.push(config.slides.FINAL_QUESTIONS);
		console.log("pushed final questions.")
		timeline.push(config.slides.RESULTS);
		return timeline;
	}

	function calculateResults() {
		let aiImages = [];
		let humanImages = [];

		participantData.responses.forEach(response => {
			if (isAIGenerated(response.imageId)) {
				aiImages.push(response);
			} else {
				humanImages.push(response);
			}
		});

		const aiStats = {
			total: aiImages.length,
			creative_percent: calculateHighPercentage(aiImages, 'creative'),
			appeal_percent: calculateHighPercentage(aiImages, 'appeal'),
			click_percent: calculateHighPercentage(aiImages, 'likelihood'),
			weird_percent: calculateHighPercentage(aiImages, 'weird'),
			sample_image: aiImages.length > 0 ? aiImages[0].imageId : ''
		};

		const humanStats = {
			total: humanImages.length,
			creative_percent: calculateHighPercentage(humanImages, 'creative'),
			appeal_percent: calculateHighPercentage(humanImages, 'appeal'),
			click_percent: calculateHighPercentage(humanImages, 'likelihood'),
			weird_percent: calculateHighPercentage(humanImages, 'weird'),
			sample_image: humanImages.length > 0 ? humanImages[0].imageId : ''
		};

		showResults({
			ai_stats: aiStats,
			human_stats: humanStats
		}, true);
	}

	function calculateHighPercentage(images, attribute) {
		if (images.length === 0) return 0;
		
		const highRatings = images.filter(img => img[attribute] >= 5).length;
		return Math.round((highRatings / images.length) * 100);
	}

	function showResults(results = {}, showFooter = false) {
		window.scrollTo(0, 0);
		
		let results_div = $("#results");
		let recom_studies = [];
		LITW.engage.getStudiesRecommendation(config.study_id, (studies) => {recom_studies = studies});

		if('PID' in LITW.data.getURLparams) {
			results.code = LITW.data.getParticipantId();
		}

		results_div.html(
			resultsTemplate({
				data: results
			}));
		if(showFooter) {
			$("#results-footer").html(resultsFooterTemplate(
				{
					share_url: window.location.href,
					share_title: $.i18n('litw-irb-header'),
					share_text: $.i18n('litw-template-title'),
					more_litw_studies: recom_studies
				}
			));
		}
		results_div.i18n();
		LITW.utils.showSlide("results");
	}

	function bootstrap() {
		initializeImageSelection();
		let good_config = LITW.engine.configure_study(config.preLoad, config.languages,
			configureTimeline(), config.study_id);
		if (good_config){
			LITW.engine.start_study();
		} else {
			console.error("Study configuration error!");
		}
	}

	$(document).ready(function() {
		bootstrap();
	});
	
	exports.study = {};
	exports.study.params = config;

})( window.LITW = window.LITW || {} );

class StudyManager {
	constructor() {
		this.selectedImages = [];
		this.currentImageIndex = 0;
		this.totalImagesToShow = 11;
		this.responses = [];
		
		// Initialize when constructed
		this.initializeImageSelection();
	}

	initializeImageSelection() {
		// Create array of all possible indices
		const allIndices = Array.from({length: IMAGE_FILES.length}, (_, i) => i);
		
		// Randomly select 11 indices
		for (let i = allIndices.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[allIndices[i], allIndices[j]] = [allIndices[j], allIndices[i]];
		}
		this.selectedImages = allIndices.slice(0, this.totalImagesToShow);
	}

	getCurrentImagePath() {
		return `./img/105-edited/${IMAGE_FILES[this.selectedImages[this.currentImageIndex]]}`;
	}

	saveResponse(response) {
		this.responses.push({
			imageId: this.selectedImages[this.currentImageIndex],
			likelihood: response.likelihood,
			appeal: response.appeal,
			creative: response.creative,
			weird: response.weird,
			timestamp: new Date().getTime()
		});
		
		this.currentImageIndex++;
		return this.currentImageIndex >= this.totalImagesToShow;
	}
}

function getQuest1Data(quest_id, completion) {
	return {
		title: $.i18n(`litw-study-${quest_id}-title`),
		progress: {
			value: completion
		},
		quest_id: quest_id,
		done_button: $.i18n(`litw-study-${quest_id}-save`),
		questions: [1, 2, 3, 4].map((x)=> {
			return {
				id: x,
				text: $.i18n(`litw-study-${quest_id}-q${x}`)
			}
		}),
		responses: [1, 2, 3, 4, 5].map((x)=> {
			return {
				id: x,
				text: $.i18n(`litw-study-quest-a${x}`)
			}
		}),
		img_prompt: {
			url: getCurrentImagePath(),
			text_before: ""
		}
	}
}

function isAIGenerated(imageId) {
	return imageId.includes('C');
}
