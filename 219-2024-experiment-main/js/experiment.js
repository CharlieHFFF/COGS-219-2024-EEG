const jsPsych = initJsPsych();

const trigger_box_html = `<div id="trigger-box" style="position: absolute; bottom:0; right:0; width:40px; height:40px; background-color:white;"></div>`;

const timeline = [];

const trigger_place_html = () => {
    is_word = jsPsych.timelineVariable('is_word')
    word_type = jsPsych.timelineVariable('word_type')
    if (is_word == true && (word_type == 'fashion' || word_type == 'moral')){
      return `<div id="trigger-box" style="position: absolute; bottom:0; right:0; width:40px; height:40px; background-color:white;"></div>`
    } else if(is_word == true && (word_type == 'non-fashion' || word_type == 'non-moral')){
      return `<div id="trigger-box" style="position: absolute; bottom:200px; right:0; width:40px; height:40px; background-color:white;"></div>`
    } else if(is_word == false && (word_type == 'fashion' || word_type == 'moral')){
      return `<div id="trigger-box" style="position: absolute; bottom:400px; right:0; width:40px; height:40px; background-color:white;"></div>`
    } else if(is_word == false && (word_type == 'non-fashion' || word_type == 'non-moral')){
      return `<div id="trigger-box" style="position: absolute; bottom:400px; right:0; width:40px; height:40px; background-color:white;"></div>
      <div id="trigger-box" style="position: absolute; bottom:0px; right:0; width:40px; height:40px; background-color:white;"></div>`
    } else{
      return ` `
    }
}

var subject_id_entry = {
  type: jsPsychSurveyNumber,
  questions: [
    { prompt: "Please enter the participant's ID", name: "subject_id", required: true }
  ],
  on_finish: function (data) {
    let sid = parseInt(data.response.subject_id);
    subject_id = sid >= 10 ? sid.toString() : "0" + sid; // sets the global variable
    jsPsych.data.addProperties({ subject_id: subject_id });
  },
  simulation_options: {
    simulate: false
  }
}

var waiting_to_start = {
  type: jsPsychHtmlKeyboardResponseRaf,
  choices: ['b'],
  stimulus: `
  <p>Thank you for participating in this study.</p>
  <p>Experimenter: please make sure the experiment is fullscreen (press F11).</p>
  <p>Press B to begin.</p>
`

}

const instruction = {
  type: jsPsychHtmlKeyboardResponseRaf,
  stimulus : `
  <p>Please keep your eyes fixed on the central cross the entire time and do your best to minimize blinking.</p>
        <p>On each trial decide if you see a word or a non-word at fixation before the &&&&&&'s.</p>
        <p>Press 1 if you see a word, and press 5 if you see a non-word.</p>
        <p>Let the experimenter know if you have any questions. Press any key to begin the practice session.</p>
        <div style='width: 700px;'>
`,
post_trial_gap: 2000
};

const practice = {
  type: jsPsychHtmlKeyboardResponseRaf,
  stimulus : `
  <p>You have now completed all 20 practice blocks.</p> 
  <div style='width: 700px;'>
  <p> Press any key to move on to the experiment.</p>
`,
post_trial_gap: 2000
};

const button = {
  type: jsPsychHtmlButtonResponse,
  stimulus: '<p> <strong> A or B? </strong></p>',
  choices: ['A', 'B'],
  prompt: "<p>Please choose between A or B</p>",
  data: {
    task: 'button'
  }
};

const trial = [];

const trial_practice = []

const fixation = {
  type: jsPsychHtmlKeyboardResponseRaf,
  stimulus: '+',
  choices: "NO_KEYS",
  css_classes: ['fixation'],
  trial_duration: () => {
    var duration = Math.random() * 300 + 400; // min time is 400ms, max time is 700ms
    // round duration to the nearest 16.667 ms
    duration = Math.round(duration / 16.667) * 16.667;
    return duration;
  }
};

var practice_word_count = 0;

const word_practice = {
  type: jsPsychHtmlKeyboardResponseRaf,
  stimulus: jsPsych.timelineVariable('word'),
  prompt: trigger_place_html,
  choices: "NO_KEYS",
  trial_duration: function(){
    if(practice_word_count < 4){
      practice_word_count++;
      return 300;
    }
    else if(practice_word_count < 8){
      practice_word_count++;
      return 150;
    }
    else if(practice_word_count < 12){
      practice_word_count++;
      return 60;
    }
    else if(practice_word_count < 16){
      practice_word_count++;
      return 30;
    }
    else if(practice_word_count < 20){
      practice_word_count++;
      return 17;
    }
  },
  css_classes: ['stimulus'],
  data: {
    task: 'word_display',
  }
};

const word = {
  type: jsPsychHtmlKeyboardResponseRaf,
  stimulus: jsPsych.timelineVariable('word'),
  prompt: trigger_place_html,
  choices: "NO_KEYS",
  trial_duration: 17,
  css_classes: ['stimulus'],
  data: {
    task: 'word_display',
  }
};

const delay_fixation = {
  type: jsPsychHtmlKeyboardResponseRaf,
  stimulus: '+',
  choices: "NO_KEYS",
  trial_duration: 33.3,
  css_classes: ['fixation'],
  data: {
    task: 'post_word_fixation'
  }
};

const mask = {
  type: jsPsychHtmlKeyboardResponseRaf,
  stimulus: () => {
    const mask_length = jsPsych.timelineVariable('word').length;
    const mask = "&".repeat(mask_length);
    return mask;
  },
  data: {
    task: 'mask'
  },
  css_classes: ['mask'],
  choices: "NO_KEYS",
  trial_duration: 25, // if we can get 120Hz refresh rate
};

const response = {
  type: jsPsychHtmlKeyboardResponseRaf,
  stimulus: "",
  choices: ['1', '5'],
  trial_duration: 1500,
  response_ends_trial: false,
  data: {
    is_word: jsPsych.timelineVariable('is_word'),
    word_type: jsPsych.timelineVariable('word_type'),
    word: jsPsych.timelineVariable('word'),
    task: 'response',
    correct_response: jsPsych.timelineVariable('correct_response')
  },
  on_finish: function (data) {
    data.correct = data.response == '1' && data.is_word == true || data.response == '5' && data.is_word == false;
  }
}

trial.push(fixation, word, delay_fixation, mask, response);

trial_practice.push(fixation, word_practice, delay_fixation, mask, response)

const test_procedure_practice = {
  timeline: trial_practice,
  timeline_variables: [
    {word: 'ghost', is_word: true, word_type: 'practice', correct_response: '1'},
    {word: 'even', is_word: true, word_type: 'practice', correct_response: '1'},
    {word: 'employee', is_word: true, word_type: 'practice', correct_response: '1'},
    {word: 'virtual', is_word: true, word_type: 'practice', correct_response: '1'},
    {word: 'background', is_word: true, word_type: 'practice', correct_response: '1'},
    {word: 'merit', is_word: true, word_type: 'practice', correct_response: '1'},
    {word: 'limited', is_word: true, word_type: 'practice', correct_response: '1'},
    {word: 'ugly', is_word: true, word_type: 'practice', correct_response: '1'},
    {word: 'hard', is_word: true, word_type: 'practice', correct_response: '1'},
    {word: 'consult', is_word: true, word_type: 'practice', correct_response: '1'},

    {word: 'luhacn', is_word: false, word_type: 'practice', correct_response: '5'},
    {word: 'uelsuf', is_word: false, word_type: 'practice', correct_response: '5'},
    {word: 'wniohrpes', is_word: false, word_type: 'practice', correct_response: '5'},
    {word: 'onscefu', is_word: false, word_type: 'practice', correct_response: '5'},
    {word: 'trkic', is_word: false, word_type: 'practice', correct_response: '5'},
    {word: 'fier', is_word: false, word_type: 'practice', correct_response: '5'},
    {word: 'onncdte', is_word: false, word_type: 'practice', correct_response: '5'},
    {word: 'treu', is_word: false, word_type: 'practice', correct_response: '5'},
  ],
  randomize_order: true
}

timeline.push(subject_id_entry, waiting_to_start, instruction, test_procedure_practice, practice, button);

const test_procedure_fashion = {
  timeline: trial,
  timeline_variables: [
    { word: 'matching', is_word: true, word_type: 'fashion', correct_response: '1'},
{ word: 'jeans', is_word: true, word_type: 'fashion', correct_response: '1'},
{ word: 'stocking', is_word: true, word_type: 'fashion', correct_response: '1'},
{ word: 'cardigan', is_word: true, word_type: 'fashion', correct_response: '1'},
{ word: 'stitch', is_word: true, word_type: 'fashion', correct_response: '1'},
{ word: 'necklace', is_word: true, word_type: 'fashion', correct_response: '1'},
{ word: 'vest', is_word: true, word_type: 'fashion', correct_response: '1'},
{ word: 'sequin', is_word: true, word_type: 'fashion', correct_response: '1'},
{ word: 'sleeve', is_word: true, word_type: 'fashion', correct_response: '1'},
{ word: 'bikini', is_word: true, word_type: 'fashion', correct_response: '1'},
{ word: 'undershirt', is_word: true, word_type: 'fashion', correct_response: '1'},
{ word: 'cotton', is_word: true, word_type: 'fashion', correct_response: '1'},
{ word: 'wrinkled', is_word: true, word_type: 'fashion', correct_response: '1'},
{ word: 'dresser', is_word: true, word_type: 'fashion', correct_response: '1'},
{ word: 'weave', is_word: true, word_type: 'fashion', correct_response: '1'},
{ word: 'outfit', is_word: true, word_type: 'fashion', correct_response: '1'},
{ word: 'shirt', is_word: true, word_type: 'fashion', correct_response: '1'},
{ word: 'sandals', is_word: true, word_type: 'fashion', correct_response: '1'},
{ word: 'shoelace', is_word: true, word_type: 'fashion', correct_response: '1'},
{ word: 'shawl', is_word: true, word_type: 'fashion', correct_response: '1'},
{ word: 'baggy', is_word: true, word_type: 'fashion', correct_response: '1'},
{ word: 'laundry', is_word: true, word_type: 'fashion', correct_response: '1'},
{ word: 'cap', is_word: true, word_type: 'fashion', correct_response: '1'},
{ word: 'garment', is_word: true, word_type: 'fashion', correct_response: '1'},
{ word: 'mittens', is_word: true, word_type: 'fashion', correct_response: '1'},
{ word: 'sunglasses', is_word: true, word_type: 'fashion', correct_response: '1'},
{ word: 'suit', is_word: true, word_type: 'fashion', correct_response: '1'},
{ word: 'comfortable', is_word: true, word_type: 'fashion', correct_response: '1'},
{ word: 'purse', is_word: true, word_type: 'fashion', correct_response: '1'},
{ word: 'slippers', is_word: true, word_type: 'fashion', correct_response: '1'},
{ word: 'apparel', is_word: true, word_type: 'fashion', correct_response: '1'},
{ word: 'blouse', is_word: true, word_type: 'fashion', correct_response: '1'},
{ word: 'preppy', is_word: true, word_type: 'fashion', correct_response: '1'},
{ word: 'leather', is_word: true, word_type: 'fashion', correct_response: '1'},
{ word: 'waistline', is_word: true, word_type: 'fashion', correct_response: '1'},
{ word: 'bracelet', is_word: true, word_type: 'fashion', correct_response: '1'},
{ word: 'sweater', is_word: true, word_type: 'fashion', correct_response: '1'},
{ word: 'poncho', is_word: true, word_type: 'fashion', correct_response: '1'},
{ word: 'headband', is_word: true, word_type: 'fashion', correct_response: '1'},
{ word: 'collar', is_word: true, word_type: 'fashion', correct_response: '1'},
{ word: 'belt', is_word: true, word_type: 'fashion', correct_response: '1'},
{ word: 'overalls', is_word: true, word_type: 'fashion', correct_response: '1'},
{ word: 'sock', is_word: true, word_type: 'fashion', correct_response: '1'},
{ word: 'denim', is_word: true, word_type: 'fashion', correct_response: '1'},
{ word: 'velvet', is_word: true, word_type: 'fashion', correct_response: '1'},
{ word: 'dress', is_word: true, word_type: 'fashion', correct_response: '1'},
{ word: 'attire', is_word: true, word_type: 'fashion', correct_response: '1'},
{ word: 'model', is_word: true, word_type: 'fashion', correct_response: '1'},
{ word: 'handbag', is_word: true, word_type: 'fashion', correct_response: '1'},
{ word: 'lining', is_word: true, word_type: 'fashion', correct_response: '1'},
{ word: 'umbrella', is_word: true, word_type: 'fashion', correct_response: '1'},
{ word: 'polyester', is_word: true, word_type: 'fashion', correct_response: '1'},
{ word: 'spandex', is_word: true, word_type: 'fashion', correct_response: '1'},
{ word: 'leotard', is_word: true, word_type: 'fashion', correct_response: '1'},
{ word: 'windbreaker', is_word: true, word_type: 'fashion', correct_response: '1'},
{ word: 'hem', is_word: true, word_type: 'fashion', correct_response: '1'},
{ word: 'boxers', is_word: true, word_type: 'fashion', correct_response: '1'},
{ word: 'ring', is_word: true, word_type: 'fashion', correct_response: '1'},
{ word: 'frilly', is_word: true, word_type: 'fashion', correct_response: '1'},
{ word: 'lingerie', is_word: true, word_type: 'fashion', correct_response: '1'},
{ word: 'uniform', is_word: true, word_type: 'fashion', correct_response: '1'},
{ word: 'apron', is_word: true, word_type: 'fashion', correct_response: '1'},
{ word: 'wool', is_word: true, word_type: 'fashion', correct_response: '1'},
{ word: 'swimsuit', is_word: true, word_type: 'fashion', correct_response: '1'},
{ word: 'flannel', is_word: true, word_type: 'fashion', correct_response: '1'},
{ word: 'zipper', is_word: true, word_type: 'fashion', correct_response: '1'},
{ word: 'casual', is_word: true, word_type: 'fashion', correct_response: '1'},
{ word: 'stiletto', is_word: true, word_type: 'fashion', correct_response: '1'},
{ word: 'elegant', is_word: true, word_type: 'fashion', correct_response: '1'},
{ word: 'glove', is_word: true, word_type: 'fashion', correct_response: '1'},
{ word: 'tailor', is_word: true, word_type: 'fashion', correct_response: '1'},
{ word: 'fleece', is_word: true, word_type: 'fashion', correct_response: '1'},
{ word: 'nightgown', is_word: true, word_type: 'fashion', correct_response: '1'},
{ word: 'fabric', is_word: true, word_type: 'fashion', correct_response: '1'},
{ word: 'silk', is_word: true, word_type: 'fashion', correct_response: '1'},

{ word: 'accepted', is_word: true, word_type: 'non-fashion', correct_response: '1'},
{ word: 'rails', is_word: true, word_type: 'non-fashion', correct_response: '1'},
{ word: 'dwelling', is_word: true, word_type: 'non-fashion', correct_response: '1'},
{ word: 'tutorial', is_word: true, word_type: 'non-fashion', correct_response: '1'},
{ word: 'engulf', is_word: true, word_type: 'non-fashion', correct_response: '1'},
{ word: 'landlord', is_word: true, word_type: 'non-fashion', correct_response: '1'},
{ word: 'pear', is_word: true, word_type: 'non-fashion', correct_response: '1'},
{ word: 'cougar', is_word: true, word_type: 'non-fashion', correct_response: '1'},
{ word: 'trauma', is_word: true, word_type: 'non-fashion', correct_response: '1'},
{ word: 'sludge', is_word: true, word_type: 'non-fashion', correct_response: '1'},
{ word: 'deflection', is_word: true, word_type: 'non-fashion', correct_response: '1'},
{ word: 'valley', is_word: true, word_type: 'non-fashion', correct_response: '1'},
{ word: 'outdated', is_word: true, word_type: 'non-fashion', correct_response: '1'},
{ word: 'asphalt', is_word: true, word_type: 'non-fashion', correct_response: '1'},
{ word: 'hover', is_word: true, word_type: 'non-fashion', correct_response: '1'},
{ word: 'streak', is_word: true, word_type: 'non-fashion', correct_response: '1'},
{ word: 'earth', is_word: true, word_type: 'non-fashion', correct_response: '1'},
{ word: 'cinemas', is_word: true, word_type: 'non-fashion', correct_response: '1'},
{ word: 'overpass', is_word: true, word_type: 'non-fashion', correct_response: '1'},
{ word: 'dummy', is_word: true, word_type: 'non-fashion', correct_response: '1'},
{ word: 'leafy', is_word: true, word_type: 'non-fashion', correct_response: '1'},
{ word: 'vinegar', is_word: true, word_type: 'non-fashion', correct_response: '1'},
{ word: 'toy', is_word: true, word_type: 'non-fashion', correct_response: '1'},
{ word: 'artwork', is_word: true, word_type: 'non-fashion', correct_response: '1'},
{ word: 'archers', is_word: true, word_type: 'non-fashion', correct_response: '1'},
{ word: 'extinction', is_word: true, word_type: 'non-fashion', correct_response: '1'},
{ word: 'gift', is_word: true, word_type: 'non-fashion', correct_response: '1'},
{ word: 'appropriate', is_word: true, word_type: 'non-fashion', correct_response: '1'},
{ word: 'shark', is_word: true, word_type: 'non-fashion', correct_response: '1'},
{ word: 'drummers', is_word: true, word_type: 'non-fashion', correct_response: '1'},
{ word: 'anomaly', is_word: true, word_type: 'non-fashion', correct_response: '1'},
{ word: 'diesel', is_word: true, word_type: 'non-fashion', correct_response: '1'},
{ word: 'snooty', is_word: true, word_type: 'non-fashion', correct_response: '1'},
{ word: 'protest', is_word: true, word_type: 'non-fashion', correct_response: '1'},
{ word: 'archivist', is_word: true, word_type: 'non-fashion', correct_response: '1'},
{ word: 'charcoal', is_word: true, word_type: 'non-fashion', correct_response: '1'},
{ word: 'harmony', is_word: true, word_type: 'non-fashion', correct_response: '1'},
{ word: 'docket', is_word: true, word_type: 'non-fashion', correct_response: '1'},
{ word: 'buzzword', is_word: true, word_type: 'non-fashion', correct_response: '1'},
{ word: 'stance', is_word: true, word_type: 'non-fashion', correct_response: '1'},
{ word: 'corn', is_word: true, word_type: 'non-fashion', correct_response: '1'},
{ word: 'pumpkins', is_word: true, word_type: 'non-fashion', correct_response: '1'},
{ word: 'pork', is_word: true, word_type: 'non-fashion', correct_response: '1'},
{ word: 'vista', is_word: true, word_type: 'non-fashion', correct_response: '1'},
{ word: 'saddle', is_word: true, word_type: 'non-fashion', correct_response: '1'},
{ word: 'limit', is_word: true, word_type: 'non-fashion', correct_response: '1'},
{ word: 'thirst', is_word: true, word_type: 'non-fashion', correct_response: '1'},
{ word: 'value', is_word: true, word_type: 'non-fashion', correct_response: '1'},
{ word: 'kickoff', is_word: true, word_type: 'non-fashion', correct_response: '1'},
{ word: 'ballad', is_word: true, word_type: 'non-fashion', correct_response: '1'},
{ word: 'revision', is_word: true, word_type: 'non-fashion', correct_response: '1'},
{ word: 'financier', is_word: true, word_type: 'non-fashion', correct_response: '1'},
{ word: 'integer', is_word: true, word_type: 'non-fashion', correct_response: '1'},
{ word: 'collard', is_word: true, word_type: 'non-fashion', correct_response: '1'},
{ word: 'romanticism', is_word: true, word_type: 'non-fashion', correct_response: '1'},
{ word: 'sub', is_word: true, word_type: 'non-fashion', correct_response: '1'},
{ word: 'vapors', is_word: true, word_type: 'non-fashion', correct_response: '1'},
{ word: 'nose', is_word: true, word_type: 'non-fashion', correct_response: '1'},
{ word: 'leaden', is_word: true, word_type: 'non-fashion', correct_response: '1'},
{ word: 'megawatt', is_word: true, word_type: 'non-fashion', correct_response: '1'},
{ word: 'fighter', is_word: true, word_type: 'non-fashion', correct_response: '1'},
{ word: 'chili', is_word: true, word_type: 'non-fashion', correct_response: '1'},
{ word: 'prey', is_word: true, word_type: 'non-fashion', correct_response: '1'},
{ word: 'futility', is_word: true, word_type: 'non-fashion', correct_response: '1'},
{ word: 'rebirth', is_word: true, word_type: 'non-fashion', correct_response: '1'},
{ word: 'homage', is_word: true, word_type: 'non-fashion', correct_response: '1'},
{ word: 'decent', is_word: true, word_type: 'non-fashion', correct_response: '1'},
{ word: 'clubface', is_word: true, word_type: 'non-fashion', correct_response: '1'},
{ word: 'teenage', is_word: true, word_type: 'non-fashion', correct_response: '1'},
{ word: 'rifle', is_word: true, word_type: 'non-fashion', correct_response: '1'},
{ word: 'marvel', is_word: true, word_type: 'non-fashion', correct_response: '1'},
{ word: 'atrium', is_word: true, word_type: 'non-fashion', correct_response: '1'},
{ word: 'manifesto', is_word: true, word_type: 'non-fashion', correct_response: '1'},
{ word: 'fellow', is_word: true, word_type: 'non-fashion', correct_response: '1'},
{ word: 'bath', is_word: true, word_type: 'non-fashion', correct_response: '1'},

{ word: 'atnmihgc', is_word: false, word_type: 'fashion', correct_response: '5'},
{ word: 'jesan', is_word: false, word_type: 'fashion', correct_response: '5'},
{ word: 'tonsikgc', is_word: false, word_type: 'fashion', correct_response: '5'},
{ word: 'aracgind', is_word: false, word_type: 'fashion', correct_response: '5'},
{ word: 'sihtct', is_word: false, word_type: 'fashion', correct_response: '5'},
{ word: 'eccnalek', is_word: false, word_type: 'fashion', correct_response: '5'},
{ word: 'svte', is_word: false, word_type: 'fashion', correct_response: '5'},
{ word: 'sqneiu', is_word: false, word_type: 'fashion', correct_response: '5'},
{ word: 'seelve', is_word: false, word_type: 'fashion', correct_response: '5'},
{ word: 'bkiini', is_word: false, word_type: 'fashion', correct_response: '5'},
{ word: 'neruistdhr', is_word: false, word_type: 'fashion', correct_response: '5'},
{ word: 'ctnoot', is_word: false, word_type: 'fashion', correct_response: '5'},
{ word: 'riewlkdn', is_word: false, word_type: 'fashion', correct_response: '5'},
{ word: 'reedrss', is_word: false, word_type: 'fashion', correct_response: '5'},
{ word: 'weeav', is_word: false, word_type: 'fashion', correct_response: '5'},
{ word: 'ottuif', is_word: false, word_type: 'fashion', correct_response: '5'},
{ word: 'shtir', is_word: false, word_type: 'fashion', correct_response: '5'},
{ word: 'anlssda', is_word: false, word_type: 'fashion', correct_response: '5'},
{ word: 'hocsalee', is_word: false, word_type: 'fashion', correct_response: '5'},
{ word: 'shlaw', is_word: false, word_type: 'fashion', correct_response: '5'},
{ word: 'baygg', is_word: false, word_type: 'fashion', correct_response: '5'},
{ word: 'aurlynd', is_word: false, word_type: 'fashion', correct_response: '5'},
{ word: 'cpa', is_word: false, word_type: 'fashion', correct_response: '5'},
{ word: 'arngtme', is_word: false, word_type: 'fashion', correct_response: '5'},
{ word: 'itnmste', is_word: false, word_type: 'fashion', correct_response: '5'},
{ word: 'ugessasnsl', is_word: false, word_type: 'fashion', correct_response: '5'},
{ word: 'suti', is_word: false, word_type: 'fashion', correct_response: '5'},
{ word: 'ofbcaremlot', is_word: false, word_type: 'fashion', correct_response: '5'},
{ word: 'puers', is_word: false, word_type: 'fashion', correct_response: '5'},
{ word: 'lirsepsp', is_word: false, word_type: 'fashion', correct_response: '5'},
{ word: 'pplaera', is_word: false, word_type: 'fashion', correct_response: '5'},
{ word: 'boelsu', is_word: false, word_type: 'fashion', correct_response: '5'},
{ word: 'peyrpp', is_word: false, word_type: 'fashion', correct_response: '5'},
{ word: 'eaelrth', is_word: false, word_type: 'fashion', correct_response: '5'},
{ word: 'asewnliit', is_word: false, word_type: 'fashion', correct_response: '5'},
{ word: 'raebletc', is_word: false, word_type: 'fashion', correct_response: '5'},
{ word: 'weesrat', is_word: false, word_type: 'fashion', correct_response: '5'},
{ word: 'pnoohc', is_word: false, word_type: 'fashion', correct_response: '5'},
{ word: 'eanhabdd', is_word: false, word_type: 'fashion', correct_response: '5'},
{ word: 'clroal', is_word: false, word_type: 'fashion', correct_response: '5'},
{ word: 'betl', is_word: false, word_type: 'fashion', correct_response: '5'},
{ word: 'velolasr', is_word: false, word_type: 'fashion', correct_response: '5'},
{ word: 'sokc', is_word: false, word_type: 'fashion', correct_response: '5'},
{ word: 'demni', is_word: false, word_type: 'fashion', correct_response: '5'},
{ word: 'vlteev', is_word: false, word_type: 'fashion', correct_response: '5'},
{ word: 'drses', is_word: false, word_type: 'fashion', correct_response: '5'},
{ word: 'atetri', is_word: false, word_type: 'fashion', correct_response: '5'},
{ word: 'emlod', is_word: false, word_type: 'fashion', correct_response: '5'},
{ word: 'anahgdb', is_word: false, word_type: 'fashion', correct_response: '5'},
{ word: 'lngini', is_word: false, word_type: 'fashion', correct_response: '5'},
{ word: 'mblulear', is_word: false, word_type: 'fashion', correct_response: '5'},
{ word: 'olepterys', is_word: false, word_type: 'fashion', correct_response: '5'},
{ word: 'paesxnd', is_word: false, word_type: 'fashion', correct_response: '5'},
{ word: 'eorldta', is_word: false, word_type: 'fashion', correct_response: '5'},
{ word: 'idkwarrnebe', is_word: false, word_type: 'fashion', correct_response: '5'},
{ word: 'hme', is_word: false, word_type: 'fashion', correct_response: '5'},
{ word: 'bxsore', is_word: false, word_type: 'fashion', correct_response: '5'},
{ word: 'rign', is_word: false, word_type: 'fashion', correct_response: '5'},
{ word: 'fiyrll', is_word: false, word_type: 'fashion', correct_response: '5'},
{ word: 'inilreeg', is_word: false, word_type: 'fashion', correct_response: '5'},
{ word: 'nirumfo', is_word: false, word_type: 'fashion', correct_response: '5'},
{ word: 'apnro', is_word: false, word_type: 'fashion', correct_response: '5'},
{ word: 'wolo', is_word: false, word_type: 'fashion', correct_response: '5'},
{ word: 'wiisustm', is_word: false, word_type: 'fashion', correct_response: '5'},
{ word: 'laeflnn', is_word: false, word_type: 'fashion', correct_response: '5'},
{ word: 'zpriep', is_word: false, word_type: 'fashion', correct_response: '5'},
{ word: 'cslaau', is_word: false, word_type: 'fashion', correct_response: '5'},
{ word: 'titsteol', is_word: false, word_type: 'fashion', correct_response: '5'},
{ word: 'lenetga', is_word: false, word_type: 'fashion', correct_response: '5'},
{ word: 'gleov', is_word: false, word_type: 'fashion', correct_response: '5'},
{ word: 'tiraol', is_word: false, word_type: 'fashion', correct_response: '5'},
{ word: 'feelce', is_word: false, word_type: 'fashion', correct_response: '5'},
{ word: 'igwnotnhg', is_word: false, word_type: 'fashion', correct_response: '5'},
{ word: 'fbcair', is_word: false, word_type: 'fashion', correct_response: '5'},
{ word: 'sikl', is_word: false, word_type: 'fashion', correct_response: '5'},

{ word: 'ccdaepet', is_word: false, word_type: 'non-fashion', correct_response: '5'},
{ word: 'rasil', is_word: false, word_type: 'non-fashion', correct_response: '5'},
{ word: 'wendilgl', is_word: false, word_type: 'non-fashion', correct_response: '5'},
{ word: 'utatirlo', is_word: false, word_type: 'non-fashion', correct_response: '5'},
{ word: 'egfnlu', is_word: false, word_type: 'non-fashion', correct_response: '5'},
{ word: 'anrloldd', is_word: false, word_type: 'non-fashion', correct_response: '5'},
{ word: 'pera', is_word: false, word_type: 'non-fashion', correct_response: '5'},
{ word: 'curoag', is_word: false, word_type: 'non-fashion', correct_response: '5'},
{ word: 'taarmu', is_word: false, word_type: 'non-fashion', correct_response: '5'},
{ word: 'suelgd', is_word: false, word_type: 'non-fashion', correct_response: '5'},
{ word: 'elodicnfte', is_word: false, word_type: 'non-fashion', correct_response: '5'},
{ word: 'vlyael', is_word: false, word_type: 'non-fashion', correct_response: '5'},
{ word: 'uteotadd', is_word: false, word_type: 'non-fashion', correct_response: '5'},
{ word: 'splatha', is_word: false, word_type: 'non-fashion', correct_response: '5'},
{ word: 'horve', is_word: false, word_type: 'non-fashion', correct_response: '5'},
{ word: 'srktae', is_word: false, word_type: 'non-fashion', correct_response: '5'},
{ word: 'eahrt', is_word: false, word_type: 'non-fashion', correct_response: '5'},
{ word: 'inacsem', is_word: false, word_type: 'non-fashion', correct_response: '5'},
{ word: 'vesoapsr', is_word: false, word_type: 'non-fashion', correct_response: '5'},
{ word: 'duymm', is_word: false, word_type: 'non-fashion', correct_response: '5'},
{ word: 'leyaf', is_word: false, word_type: 'non-fashion', correct_response: '5'},
{ word: 'inavreg', is_word: false, word_type: 'non-fashion', correct_response: '5'},
{ word: 'tyo', is_word: false, word_type: 'non-fashion', correct_response: '5'},
{ word: 'rtrakwo', is_word: false, word_type: 'non-fashion', correct_response: '5'},
{ word: 'rcrashe', is_word: false, word_type: 'non-fashion', correct_response: '5'},
{ word: 'xioeicnttn', is_word: false, word_type: 'non-fashion', correct_response: '5'},
{ word: 'fgti', is_word: false, word_type: 'non-fashion', correct_response: '5'},
{ word: 'praaipeptor', is_word: false, word_type: 'non-fashion', correct_response: '5'},
{ word: 'shkar', is_word: false, word_type: 'non-fashion', correct_response: '5'},
{ word: 'rurdemsm', is_word: false, word_type: 'non-fashion', correct_response: '5'},
{ word: 'nolayama', is_word: false, word_type: 'non-fashion', correct_response: '5'},
{ word: 'delies', is_word: false, word_type: 'non-fashion', correct_response: '5'},
{ word: 'soynto', is_word: false, word_type: 'non-fashion', correct_response: '5'},
{ word: 'rosptte', is_word: false, word_type: 'non-fashion', correct_response: '5'},
{ word: 'rcsaiithv', is_word: false, word_type: 'non-fashion', correct_response: '5'},
{ word: 'haacoclr', is_word: false, word_type: 'non-fashion', correct_response: '5'},
{ word: 'arnhymo', is_word: false, word_type: 'non-fashion', correct_response: '5'},
{ word: 'dctoek', is_word: false, word_type: 'non-fashion', correct_response: '5'},
{ word: 'uzrbowdz', is_word: false, word_type: 'non-fashion', correct_response: '5'},
{ word: 'saetcn', is_word: false, word_type: 'non-fashion', correct_response: '5'},
{ word: 'conr', is_word: false, word_type: 'non-fashion', correct_response: '5'},
{ word: 'umnpiksp', is_word: false, word_type: 'non-fashion', correct_response: '5'},
{ word: 'pokr', is_word: false, word_type: 'non-fashion', correct_response: '5'},
{ word: 'viast', is_word: false, word_type: 'non-fashion', correct_response: '5'},
{ word: 'sdeald', is_word: false, word_type: 'non-fashion', correct_response: '5'},
{ word: 'litmi', is_word: false, word_type: 'non-fashion', correct_response: '5'},
{ word: 'tithsr', is_word: false, word_type: 'non-fashion', correct_response: '5'},
{ word: 'vaelu', is_word: false, word_type: 'non-fashion', correct_response: '5'},
{ word: 'icfkfko', is_word: false, word_type: 'non-fashion', correct_response: '5'},
{ word: 'bldaal', is_word: false, word_type: 'non-fashion', correct_response: '5'},
{ word: 'evorisni', is_word: false, word_type: 'non-fashion', correct_response: '5'},
{ word: 'inefinrac', is_word: false, word_type: 'non-fashion', correct_response: '5'},
{ word: 'nteireg', is_word: false, word_type: 'non-fashion', correct_response: '5'},
{ word: 'olrcdla', is_word: false, word_type: 'non-fashion', correct_response: '5'},
{ word: 'oairctmmsni', is_word: false, word_type: 'non-fashion', correct_response: '5'},
{ word: 'sbu', is_word: false, word_type: 'non-fashion', correct_response: '5'},
{ word: 'vpsaro', is_word: false, word_type: 'non-fashion', correct_response: '5'},
{ word: 'sneo', is_word: false, word_type: 'non-fashion', correct_response: '5'},
{ word: 'laneed', is_word: false, word_type: 'non-fashion', correct_response: '5'},
{ word: 'egtmawta', is_word: false, word_type: 'non-fashion', correct_response: '5'},
{ word: 'igefrht', is_word: false, word_type: 'non-fashion', correct_response: '5'},
{ word: 'icilh', is_word: false, word_type: 'non-fashion', correct_response: '5'},
{ word: 'epry', is_word: false, word_type: 'non-fashion', correct_response: '5'},
{ word: 'uttfilyi', is_word: false, word_type: 'non-fashion', correct_response: '5'},
{ word: 'ebtrhir', is_word: false, word_type: 'non-fashion', correct_response: '5'},
{ word: 'hmeoga', is_word: false, word_type: 'non-fashion', correct_response: '5'},
{ word: 'dctene', is_word: false, word_type: 'non-fashion', correct_response: '5'},
{ word: 'luccafeb', is_word: false, word_type: 'non-fashion', correct_response: '5'},
{ word: 'eegtena', is_word: false, word_type: 'non-fashion', correct_response: '5'},
{ word: 'riefl', is_word: false, word_type: 'non-fashion', correct_response: '5'},
{ word: 'mrlaev', is_word: false, word_type: 'non-fashion', correct_response: '5'},
{ word: 'armtui', is_word: false, word_type: 'non-fashion', correct_response: '5'},
{ word: 'antmsfoie', is_word: false, word_type: 'non-fashion', correct_response: '5'},
{ word: 'flweol', is_word: false, word_type: 'non-fashion', correct_response: '5'},
{ word: 'tbah', is_word: false, word_type: 'non-fashion', correct_response: '5'},
  ],
  randomize_order: true
}

const test_procedure_moral = {
  timeline: trial,
  timeline_variables: [
    { word: 'lust', is_word: true, word_type: 'moral', correct_response: '1'},
{ word: 'devout', is_word: true, word_type: 'moral', correct_response: '1'},
{ word: 'holy', is_word: true, word_type: 'moral', correct_response: '1'},
{ word: 'murder', is_word: true, word_type: 'moral', correct_response: '1'},
{ word: 'responsible', is_word: true, word_type: 'moral', correct_response: '1'},
{ word: 'convict', is_word: true, word_type: 'moral', correct_response: '1'},
{ word: 'revenge', is_word: true, word_type: 'moral', correct_response: '1'},
{ word: 'reprehensible', is_word: true, word_type: 'moral', correct_response: '1'},
{ word: 'blame', is_word: true, word_type: 'moral', correct_response: '1'},
{ word: 'honorable', is_word: true, word_type: 'moral', correct_response: '1'},
{ word: 'corrupt', is_word: true, word_type: 'moral', correct_response: '1'},
{ word: 'violate', is_word: true, word_type: 'moral', correct_response: '1'},
{ word: 'fault', is_word: true, word_type: 'moral', correct_response: '1'},
{ word: 'heaven', is_word: true, word_type: 'moral', correct_response: '1'},
{ word: 'shame', is_word: true, word_type: 'moral', correct_response: '1'},
{ word: 'adultery', is_word: true, word_type: 'moral', correct_response: '1'},
{ word: 'envy', is_word: true, word_type: 'moral', correct_response: '1'},
{ word: 'compassion', is_word: true, word_type: 'moral', correct_response: '1'},
{ word: 'jury', is_word: true, word_type: 'moral', correct_response: '1'},
{ word: 'torment', is_word: true, word_type: 'moral', correct_response: '1'},
{ word: 'crime', is_word: true, word_type: 'moral', correct_response: '1'},
{ word: 'demon', is_word: true, word_type: 'moral', correct_response: '1'},
{ word: 'atrocity', is_word: true, word_type: 'moral', correct_response: '1'},
{ word: 'angel', is_word: true, word_type: 'moral', correct_response: '1'},
{ word: 'altruism', is_word: true, word_type: 'moral', correct_response: '1'},
{ word: 'hero', is_word: true, word_type: 'moral', correct_response: '1'},
{ word: 'vile', is_word: true, word_type: 'moral', correct_response: '1'},
{ word: 'sin', is_word: true, word_type: 'moral', correct_response: '1'},
{ word: 'piety', is_word: true, word_type: 'moral', correct_response: '1'},
{ word: 'cheat', is_word: true, word_type: 'moral', correct_response: '1'},
{ word: 'traitor', is_word: true, word_type: 'moral', correct_response: '1'},
{ word: 'abomination', is_word: true, word_type: 'moral', correct_response: '1'},
{ word: 'incest', is_word: true, word_type: 'moral', correct_response: '1'},
{ word: 'nazi', is_word: true, word_type: 'moral', correct_response: '1'},
{ word: 'covet', is_word: true, word_type: 'moral', correct_response: '1'},
{ word: 'fair', is_word: true, word_type: 'moral', correct_response: '1'},
{ word: 'justice', is_word: true, word_type: 'moral', correct_response: '1'},
{ word: 'cruel', is_word: true, word_type: 'moral', correct_response: '1'},
{ word: 'profane', is_word: true, word_type: 'moral', correct_response: '1'},
{ word: 'punishment', is_word: true, word_type: 'moral', correct_response: '1'},
{ word: 'soldier', is_word: true, word_type: 'moral', correct_response: '1'},
{ word: 'saint', is_word: true, word_type: 'moral', correct_response: '1'},
{ word: 'transgression', is_word: true, word_type: 'moral', correct_response: '1'},
{ word: 'fraud', is_word: true, word_type: 'moral', correct_response: '1'},
{ word: 'purity', is_word: true, word_type: 'moral', correct_response: '1'},
{ word: 'heinous', is_word: true, word_type: 'moral', correct_response: '1'},
{ word: 'save', is_word: true, word_type: 'moral', correct_response: '1'},
{ word: 'suffering', is_word: true, word_type: 'moral', correct_response: '1'},
{ word: 'greed', is_word: true, word_type: 'moral', correct_response: '1'},
{ word: 'prison', is_word: true, word_type: 'moral', correct_response: '1'},
{ word: 'betray', is_word: true, word_type: 'moral', correct_response: '1'},
{ word: 'punish', is_word: true, word_type: 'moral', correct_response: '1'},
{ word: 'hurt', is_word: true, word_type: 'moral', correct_response: '1'},
{ word: 'pain', is_word: true, word_type: 'moral', correct_response: '1'},
{ word: 'sinister', is_word: true, word_type: 'moral', correct_response: '1'},
{ word: 'exploit', is_word: true, word_type: 'moral', correct_response: '1'},
{ word: 'injure', is_word: true, word_type: 'moral', correct_response: '1'},
{ word: 'vulgar', is_word: true, word_type: 'moral', correct_response: '1'},
{ word: 'innocent', is_word: true, word_type: 'moral', correct_response: '1'},
{ word: 'forbid', is_word: true, word_type: 'moral', correct_response: '1'},
{ word: 'kill', is_word: true, word_type: 'moral', correct_response: '1'},
{ word: 'infidelity', is_word: true, word_type: 'moral', correct_response: '1'},
{ word: 'obscene', is_word: true, word_type: 'moral', correct_response: '1'},
{ word: 'racism', is_word: true, word_type: 'moral', correct_response: '1'},
{ word: 'kidnap', is_word: true, word_type: 'moral', correct_response: '1'},
{ word: 'disloyal', is_word: true, word_type: 'moral', correct_response: '1'},
{ word: 'conscience', is_word: true, word_type: 'moral', correct_response: '1'},
{ word: 'ought', is_word: true, word_type: 'moral', correct_response: '1'},
{ word: 'ideal', is_word: true, word_type: 'moral', correct_response: '1'},
{ word: 'guilty', is_word: true, word_type: 'moral', correct_response: '1'},
{ word: 'divinity', is_word: true, word_type: 'moral', correct_response: '1'},
{ word: 'help', is_word: true, word_type: 'moral', correct_response: '1'},
{ word: 'should', is_word: true, word_type: 'moral', correct_response: '1'},
{ word: 'jail', is_word: true, word_type: 'moral', correct_response: '1'},
{ word: 'law', is_word: true, word_type: 'moral', correct_response: '1'},

{ word: 'adore', is_word: true, word_type: 'non-moral', correct_response: '1'},
{ word: 'aspiring', is_word: true, word_type: 'non-moral', correct_response: '1'},
{ word: 'ring', is_word: true, word_type: 'non-moral', correct_response: '1'},
{ word: 'failure', is_word: true, word_type: 'non-moral', correct_response: '1'},
{ word: 'independent', is_word: true, word_type: 'non-moral', correct_response: '1'},
{ word: 'confuse', is_word: true, word_type: 'non-moral', correct_response: '1'},
{ word: 'offend', is_word: true, word_type: 'non-moral', correct_response: '1'},
{ word: 'antagonize', is_word: true, word_type: 'non-moral', correct_response: '1'},
{ word: 'afford', is_word: true, word_type: 'non-moral', correct_response: '1'},
{ word: 'affiliation', is_word: true, word_type: 'non-moral', correct_response: '1'},
{ word: 'obscure', is_word: true, word_type: 'non-moral', correct_response: '1'},
{ word: 'pet', is_word: true, word_type: 'non-moral', correct_response: '1'},
{ word: 'loss', is_word: true, word_type: 'non-moral', correct_response: '1'},
{ word: 'ceiling', is_word: true, word_type: 'non-moral', correct_response: '1'},
{ word: 'chaos', is_word: true, word_type: 'non-moral', correct_response: '1'},
{ word: 'remarry', is_word: true, word_type: 'non-moral', correct_response: '1'},
{ word: 'fake', is_word: true, word_type: 'non-moral', correct_response: '1'},
{ word: 'considering', is_word: true, word_type: 'non-moral', correct_response: '1'},
{ word: 'poll', is_word: true, word_type: 'non-moral', correct_response: '1'},
{ word: 'clamor', is_word: true, word_type: 'non-moral', correct_response: '1'},
{ word: 'steel', is_word: true, word_type: 'non-moral', correct_response: '1'},
{ word: 'anger', is_word: true, word_type: 'non-moral', correct_response: '1'},
{ word: 'exhausted', is_word: true, word_type: 'non-moral', correct_response: '1'},
{ word: 'kiss', is_word: true, word_type: 'non-moral', correct_response: '1'},
{ word: 'reasoned', is_word: true, word_type: 'non-moral', correct_response: '1'},
{ word: 'pilot', is_word: true, word_type: 'non-moral', correct_response: '1'},
{ word: 'brash', is_word: true, word_type: 'non-moral', correct_response: '1'},
{ word: 'assault', is_word: true, word_type: 'non-moral', correct_response: '1'},
{ word: 'solace', is_word: true, word_type: 'non-moral', correct_response: '1'},
{ word: 'rival', is_word: true, word_type: 'non-moral', correct_response: '1'},
{ word: 'sucker', is_word: true, word_type: 'non-moral', correct_response: '1'},
{ word: 'liquidation', is_word: true, word_type: 'non-moral', correct_response: '1'},
{ word: 'polio', is_word: true, word_type: 'non-moral', correct_response: '1'},
{ word: 'flaw', is_word: true, word_type: 'non-moral', correct_response: '1'},
{ word: 'gnaw', is_word: true, word_type: 'non-moral', correct_response: '1'},
{ word: 'kind', is_word: true, word_type: 'non-moral', correct_response: '1'},
{ word: 'exchange', is_word: true, word_type: 'non-moral', correct_response: '1'},
{ word: 'trouble', is_word: true, word_type: 'non-moral', correct_response: '1'},
{ word: 'impolite', is_word: true, word_type: 'non-moral', correct_response: '1'},
{ word: 'ownership', is_word: true, word_type: 'non-moral', correct_response: '1'},
{ word: 'shoulder', is_word: true, word_type: 'non-moral', correct_response: '1'},
{ word: 'crown', is_word: true, word_type: 'non-moral', correct_response: '1'},
{ word: 'irritating', is_word: true, word_type: 'non-moral', correct_response: '1'},
{ word: 'snake', is_word: true, word_type: 'non-moral', correct_response: '1'},
{ word: 'prudent', is_word: true, word_type: 'non-moral', correct_response: '1'},
{ word: 'outlandish', is_word: true, word_type: 'non-moral', correct_response: '1'},
{ word: 'stay', is_word: true, word_type: 'non-moral', correct_response: '1'},
{ word: 'accounting', is_word: true, word_type: 'non-moral', correct_response: '1'},
{ word: 'mourn', is_word: true, word_type: 'non-moral', correct_response: '1'},
{ word: 'guard', is_word: true, word_type: 'non-moral', correct_response: '1'},
{ word: 'bargain', is_word: true, word_type: 'non-moral', correct_response: '1'},
{ word: 'assert', is_word: true, word_type: 'non-moral', correct_response: '1'},
{ word: 'kick', is_word: true, word_type: 'non-moral', correct_response: '1'},
{ word: 'fail', is_word: true, word_type: 'non-moral', correct_response: '1'},
{ word: 'unsettle', is_word: true, word_type: 'non-moral', correct_response: '1'},
{ word: 'upset', is_word: true, word_type: 'non-moral', correct_response: '1'},
{ word: 'crash', is_word: true, word_type: 'non-moral', correct_response: '1'},
{ word: 'edgy', is_word: true, word_type: 'non-moral', correct_response: '1'},
{ word: 'attractive', is_word: true, word_type: 'non-moral', correct_response: '1'},
{ word: 'interfere', is_word: true, word_type: 'non-moral', correct_response: '1'},
{ word: 'die', is_word: true, word_type: 'non-moral', correct_response: '1'},
{ word: 'infertility', is_word: true, word_type: 'non-moral', correct_response: '1'},
{ word: 'greasy', is_word: true, word_type: 'non-moral', correct_response: '1'},
{ word: 'diminish', is_word: true, word_type: 'non-moral', correct_response: '1'},
{ word: 'gossip', is_word: true, word_type: 'non-moral', correct_response: '1'},
{ word: 'bothersome', is_word: true, word_type: 'non-moral', correct_response: '1'},
{ word: 'compromise', is_word: true, word_type: 'non-moral', correct_response: '1'},
{ word: 'obvious', is_word: true, word_type: 'non-moral', correct_response: '1'},
{ word: 'correct', is_word: true, word_type: 'non-moral', correct_response: '1'},
{ word: 'tired', is_word: true, word_type: 'non-moral', correct_response: '1'},
{ word: 'police', is_word: true, word_type: 'non-moral', correct_response: '1'},
{ word: 'begin', is_word: true, word_type: 'non-moral', correct_response: '1'},
{ word: 'could', is_word: true, word_type: 'non-moral', correct_response: '1'},
{ word: 'house', is_word: true, word_type: 'non-moral', correct_response: '1'},
{ word: 'rule', is_word: true, word_type: 'non-moral', correct_response: '1'},

{ word: 'luts', is_word: false, word_type: 'moral', correct_response: '5'},
{ word: 'dvteuo', is_word: false, word_type: 'moral', correct_response: '5'},
{ word: 'hoyl', is_word: false, word_type: 'moral', correct_response: '5'},
{ word: 'mrrued', is_word: false, word_type: 'moral', correct_response: '5'},
{ word: 'eplrbssione', is_word: false, word_type: 'moral', correct_response: '5'},
{ word: 'oncctvi', is_word: false, word_type: 'moral', correct_response: '5'},
{ word: 'gveeern', is_word: false, word_type: 'moral', correct_response: '5'},
{ word: 'erbrieepsehnl', is_word: false, word_type: 'moral', correct_response: '5'},
{ word: 'mbela', is_word: false, word_type: 'moral', correct_response: '5'},
{ word: 'onlhbreoa', is_word: false, word_type: 'moral', correct_response: '5'},
{ word: 'orpctru', is_word: false, word_type: 'moral', correct_response: '5'},
{ word: 'iotvela', is_word: false, word_type: 'moral', correct_response: '5'},
{ word: 'fatul', is_word: false, word_type: 'moral', correct_response: '5'},
{ word: 'haneev', is_word: false, word_type: 'moral', correct_response: '5'},
{ word: 'mseha', is_word: false, word_type: 'moral', correct_response: '5'},
{ word: 'duyartle', is_word: false, word_type: 'moral', correct_response: '5'},
{ word: 'enyv', is_word: false, word_type: 'moral', correct_response: '5'},
{ word: 'opocisnmsa', is_word: false, word_type: 'moral', correct_response: '5'},
{ word: 'juyr', is_word: false, word_type: 'moral', correct_response: '5'},
{ word: 'ornttme', is_word: false, word_type: 'moral', correct_response: '5'},
{ word: 'creim', is_word: false, word_type: 'moral', correct_response: '5'},
{ word: 'denmo', is_word: false, word_type: 'moral', correct_response: '5'},
{ word: 'tryatcoi', is_word: false, word_type: 'moral', correct_response: '5'},
{ word: 'anlge', is_word: false, word_type: 'moral', correct_response: '5'},
{ word: 'ltmasuri', is_word: false, word_type: 'moral', correct_response: '5'},
{ word: 'heor', is_word: false, word_type: 'moral', correct_response: '5'},
{ word: 'viel', is_word: false, word_type: 'moral', correct_response: '5'},
{ word: 'sni', is_word: false, word_type: 'moral', correct_response: '5'},
{ word: 'piyet', is_word: false, word_type: 'moral', correct_response: '5'},
{ word: 'chtea', is_word: false, word_type: 'moral', correct_response: '5'},
{ word: 'rartoti', is_word: false, word_type: 'moral', correct_response: '5'},
{ word: 'bmoaiaotinn', is_word: false, word_type: 'moral', correct_response: '5'},
{ word: 'ictnse', is_word: false, word_type: 'moral', correct_response: '5'},
{ word: 'naiz', is_word: false, word_type: 'moral', correct_response: '5'},
{ word: 'cotve', is_word: false, word_type: 'moral', correct_response: '5'},
{ word: 'fari', is_word: false, word_type: 'moral', correct_response: '5'},
{ word: 'uscjeti', is_word: false, word_type: 'moral', correct_response: '5'},
{ word: 'crlue', is_word: false, word_type: 'moral', correct_response: '5'},
{ word: 'ronpefa', is_word: false, word_type: 'moral', correct_response: '5'},
{ word: 'uinpehsntm', is_word: false, word_type: 'moral', correct_response: '5'},
{ word: 'olesrdi', is_word: false, word_type: 'moral', correct_response: '5'},
{ word: 'nstai', is_word: false, word_type: 'moral', correct_response: '5'},
{ word: 'rnitsrnassgeo', is_word: false, word_type: 'moral', correct_response: '5'},
{ word: 'frdau', is_word: false, word_type: 'moral', correct_response: '5'},
{ word: 'pryuti', is_word: false, word_type: 'moral', correct_response: '5'},
{ word: 'eishuon', is_word: false, word_type: 'moral', correct_response: '5'},
{ word: 'saev', is_word: false, word_type: 'moral', correct_response: '5'},
{ word: 'ufnsiegfr', is_word: false, word_type: 'moral', correct_response: '5'},
{ word: 'grdee', is_word: false, word_type: 'moral', correct_response: '5'},
{ word: 'pinros', is_word: false, word_type: 'moral', correct_response: '5'},
{ word: 'btyear', is_word: false, word_type: 'moral', correct_response: '5'},
{ word: 'pnhusi', is_word: false, word_type: 'moral', correct_response: '5'},
{ word: 'hutr', is_word: false, word_type: 'moral', correct_response: '5'},
{ word: 'pani', is_word: false, word_type: 'moral', correct_response: '5'},
{ word: 'inestsri', is_word: false, word_type: 'moral', correct_response: '5'},
{ word: 'xpietlo', is_word: false, word_type: 'moral', correct_response: '5'},
{ word: 'ijenru', is_word: false, word_type: 'moral', correct_response: '5'},
{ word: 'vlruag', is_word: false, word_type: 'moral', correct_response: '5'},
{ word: 'nnniecto', is_word: false, word_type: 'moral', correct_response: '5'},
{ word: 'frdoib', is_word: false, word_type: 'moral', correct_response: '5'},
{ word: 'lilk', is_word: false, word_type: 'moral', correct_response: '5'},
{ word: 'nitiieyfld', is_word: false, word_type: 'moral', correct_response: '5'},
{ word: 'bsnoece', is_word: false, word_type: 'moral', correct_response: '5'},
{ word: 'rcmasi', is_word: false, word_type: 'moral', correct_response: '5'},
{ word: 'kdpian', is_word: false, word_type: 'moral', correct_response: '5'},
{ word: 'isadyoll', is_word: false, word_type: 'moral', correct_response: '5'},
{ word: 'osccninece', is_word: false, word_type: 'moral', correct_response: '5'},
{ word: 'outgh', is_word: false, word_type: 'moral', correct_response: '5'},
{ word: 'idlea', is_word: false, word_type: 'moral', correct_response: '5'},
{ word: 'giyutl', is_word: false, word_type: 'moral', correct_response: '5'},
{ word: 'ivtdinyi', is_word: false, word_type: 'moral', correct_response: '5'},
{ word: 'hepl', is_word: false, word_type: 'moral', correct_response: '5'},
{ word: 'sodhlu', is_word: false, word_type: 'moral', correct_response: '5'},
{ word: 'jali', is_word: false, word_type: 'moral', correct_response: '5'},
{ word: 'lwa', is_word: false, word_type: 'moral', correct_response: '5'},

{ word: 'adoer', is_word: false, word_type: 'non-moral', correct_response: '5'},
{ word: 'spnairgi', is_word: false, word_type: 'non-moral', correct_response: '5'},
{ word: 'rign', is_word: false, word_type: 'non-moral', correct_response: '5'},
{ word: 'airfelu', is_word: false, word_type: 'non-moral', correct_response: '5'},
{ word: 'neeidetdnpn', is_word: false, word_type: 'non-moral', correct_response: '5'},
{ word: 'onscefu', is_word: false, word_type: 'non-moral', correct_response: '5'},
{ word: 'ofdfne', is_word: false, word_type: 'non-moral', correct_response: '5'},
{ word: 'nazaioetng', is_word: false, word_type: 'non-moral', correct_response: '5'},
{ word: 'afdfro', is_word: false, word_type: 'non-moral', correct_response: '5'},
{ word: 'fiiatinfola', is_word: false, word_type: 'non-moral', correct_response: '5'},
{ word: 'bsroecu', is_word: false, word_type: 'non-moral', correct_response: '5'},
{ word: 'pte', is_word: false, word_type: 'non-moral', correct_response: '5'},
{ word: 'sosl', is_word: false, word_type: 'non-moral', correct_response: '5'},
{ word: 'eincgli', is_word: false, word_type: 'non-moral', correct_response: '5'},
{ word: 'chsao', is_word: false, word_type: 'non-moral', correct_response: '5'},
{ word: 'emrryar', is_word: false, word_type: 'non-moral', correct_response: '5'},
{ word: 'faek', is_word: false, word_type: 'non-moral', correct_response: '5'},
{ word: 'osicrdgnnie', is_word: false, word_type: 'non-moral', correct_response: '5'},
{ word: 'lolp', is_word: false, word_type: 'non-moral', correct_response: '5'},
{ word: 'carlom', is_word: false, word_type: 'non-moral', correct_response: '5'},
{ word: 'stlee', is_word: false, word_type: 'non-moral', correct_response: '5'},
{ word: 'anrge', is_word: false, word_type: 'non-moral', correct_response: '5'},
{ word: 'xheetudas', is_word: false, word_type: 'non-moral', correct_response: '5'},
{ word: 'kssi', is_word: false, word_type: 'non-moral', correct_response: '5'},
{ word: 'eaernods', is_word: false, word_type: 'non-moral', correct_response: '5'},
{ word: 'pitlo', is_word: false, word_type: 'non-moral', correct_response: '5'},
{ word: 'brhas', is_word: false, word_type: 'non-moral', correct_response: '5'},
{ word: 'sslatau', is_word: false, word_type: 'non-moral', correct_response: '5'},
{ word: 'sleoca', is_word: false, word_type: 'non-moral', correct_response: '5'},
{ word: 'rilva', is_word: false, word_type: 'non-moral', correct_response: '5'},
{ word: 'scruek', is_word: false, word_type: 'non-moral', correct_response: '5'},
{ word: 'iuiltdnqoia', is_word: false, word_type: 'non-moral', correct_response: '5'},
{ word: 'oolpi', is_word: false, word_type: 'non-moral', correct_response: '5'},
{ word: 'flwa', is_word: false, word_type: 'non-moral', correct_response: '5'},
{ word: 'gnwa', is_word: false, word_type: 'non-moral', correct_response: '5'},
{ word: 'kidn', is_word: false, word_type: 'non-moral', correct_response: '5'},
{ word: 'xcgenaeh', is_word: false, word_type: 'non-moral', correct_response: '5'},
{ word: 'rolteub', is_word: false, word_type: 'non-moral', correct_response: '5'},
{ word: 'mptiileo', is_word: false, word_type: 'non-moral', correct_response: '5'},
{ word: 'wniohrpes', is_word: false, word_type: 'non-moral', correct_response: '5'},
{ word: 'hoesdlru', is_word: false, word_type: 'non-moral', correct_response: '5'},
{ word: 'crnow', is_word: false, word_type: 'non-moral', correct_response: '5'},
{ word: 'riniiagrtt', is_word: false, word_type: 'non-moral', correct_response: '5'},
{ word: 'neask', is_word: false, word_type: 'non-moral', correct_response: '5'},
{ word: 'runptde', is_word: false, word_type: 'non-moral', correct_response: '5'},
{ word: 'ulsoinhtda', is_word: false, word_type: 'non-moral', correct_response: '5'},
{ word: 'asyt', is_word: false, word_type: 'non-moral', correct_response: '5'},
{ word: 'conaingctu', is_word: false, word_type: 'non-moral', correct_response: '5'},
{ word: 'monur', is_word: false, word_type: 'non-moral', correct_response: '5'},
{ word: 'guadr', is_word: false, word_type: 'non-moral', correct_response: '5'},
{ word: 'aribnga', is_word: false, word_type: 'non-moral', correct_response: '5'},
{ word: 'astsre', is_word: false, word_type: 'non-moral', correct_response: '5'},
{ word: 'kikc', is_word: false, word_type: 'non-moral', correct_response: '5'},
{ word: 'fali', is_word: false, word_type: 'non-moral', correct_response: '5'},
{ word: 'netetuls', is_word: false, word_type: 'non-moral', correct_response: '5'},
{ word: 'uptse', is_word: false, word_type: 'non-moral', correct_response: '5'},
{ word: 'crhas', is_word: false, word_type: 'non-moral', correct_response: '5'},
{ word: 'edyg', is_word: false, word_type: 'non-moral', correct_response: '5'},
{ word: 'trvaicetta', is_word: false, word_type: 'non-moral', correct_response: '5'},
{ word: 'ntriereef', is_word: false, word_type: 'non-moral', correct_response: '5'},
{ word: 'edi', is_word: false, word_type: 'non-moral', correct_response: '5'},
{ word: 'neiiltyftri', is_word: false, word_type: 'non-moral', correct_response: '5'},
{ word: 'geyrsa', is_word: false, word_type: 'non-moral', correct_response: '5'},
{ word: 'imsdinhi', is_word: false, word_type: 'non-moral', correct_response: '5'},
{ word: 'gspois', is_word: false, word_type: 'non-moral', correct_response: '5'},
{ word: 'ohmboretse', is_word: false, word_type: 'non-moral', correct_response: '5'},
{ word: 'opscioemmr', is_word: false, word_type: 'non-moral', correct_response: '5'},
{ word: 'bvuosio', is_word: false, word_type: 'non-moral', correct_response: '5'},
{ word: 'orcctre', is_word: false, word_type: 'non-moral', correct_response: '5'},
{ word: 'tidre', is_word: false, word_type: 'non-moral', correct_response: '5'},
{ word: 'pleoci', is_word: false, word_type: 'non-moral', correct_response: '5'},
{ word: 'begni', is_word: false, word_type: 'non-moral', correct_response: '5'},
{ word: 'codul', is_word: false, word_type: 'non-moral', correct_response: '5'},
{ word: 'hoeus', is_word: false, word_type: 'non-moral', correct_response: '5'},
{ word: 'lrue', is_word: false, word_type: 'non-moral', correct_response: '5'},
  ],
  randomize_order: true
}

const if_procedure_f = {
  timeline: [test_procedure_fashion],
  conditional_function: function(){
      // get the data from the previous trial,
      // and check which key was pressed
      data = jsPsych.data.get().filter({task: 'button'}).values()[0]
      if(data.response == 1){
          return true;
      } else {
          return false;
      }
  }
}

const if_procedure_m = {
  timeline: [test_procedure_moral],
  conditional_function: function(){
      // get the data from the previous trial,
      // and check which key was pressed
      data = jsPsych.data.get().filter({task: 'button'}).values()[0]
      if(data.response == 0){
          return true;
      } else {
          return false;
      }
  }
}

const short_break = {
  type: jsPsychHtmlKeyboardResponseRaf,
  stimulus: 'You have now completed the first block of trials.  Press any key to move on to the second block. '
};

const if_procedure_f2 = {
  timeline: [test_procedure_fashion],
  conditional_function: function(){
      // get the data from the previous trial,
      // and check which key was pressed
      data = jsPsych.data.get().filter({task: 'button'}).values()[0]
      if(data.response == 0){
          return true;
      } else {
          return false;
      }
  }
}

const if_procedure_m2 = {
  timeline: [test_procedure_fashion],
  conditional_function: function(){
      // get the data from the previous trial,
      // and check which key was pressed
      data = jsPsych.data.get().filter({task: 'button'}).values()[0]
      if(data.response == 1){
          return true;
      } else {
          return false;
      }
  }
}

var debrief_block =
      {
        type: jsPsychHtmlKeyboardResponseRaf,
        stimulus: `
        <p>You have now completed the experiment.</p>
        <p>Thank you for your participation. </p>
        <p>Wait for the experimenter to return to the test room to remove the cap.</p>
        <div style='width: 700px;'>`,
        choices: "NO_KEYS",
        on_start: function () {
          jsPsych.data.get().localSave('json', `219_2024_behavioral_${subject_id}.json`);
        },
        simulation_options: {
          simulate: false
        }
      };


timeline.push(if_procedure_m, if_procedure_f, short_break, if_procedure_f2, if_procedure_m2, debrief_block);

jsPsych.run(timeline);