import less from './style.less';
import $ from 'jquery';

const scores = require('./scores.json');
const scoreFilterOperators = {
    'high': function(rawScore, scoreInput) { return rawScore <= scoreInput},
    'low': function(rawScore, scoreInput) { return rawScore >= scoreInput}
}
const hvyMin = 80;
const sigMin = 70;
const modMin = 60;

$(document).ready(function(){
    $('#calculate-button').click(function(){
        let totalScore = 0;
        // Remove exiting calculated score classes
        $('[id$=\'-score-output\']').removeClass(function (index, className) {
            return (className.match (/calculated-score-\S+/g) || []).join(' ');
        });
        let totalScoreClass = '';
        $.each(scores, function(event) {
            let score = calculateScore(event, $('#' + event + '-score-input').val());
            $('#' + event + '-score-output').val(score);
            // Add class based on score
            if(score >= hvyMin) {
                $('#' + event + '-score-output').addClass('calculated-score-hvy');
                if(totalScoreClass !== 'sig' && totalScoreClass !== 'mod' && totalScoreClass !== 'fail'){ totalScoreClass = 'hvy'; }
            } else if(score >= sigMin) {
                $('#' + event + '-score-output').addClass('calculated-score-sig');
                if(totalScoreClass !== 'mod' && totalScoreClass !== 'fail'){ totalScoreClass = 'sig'; }
            } else if(score >= modMin) {
                $('#' + event + '-score-output').addClass('calculated-score-mod');
                if(totalScoreClass !== 'fail'){ totalScoreClass = 'mod'; }
            } else {
                $('#' + event + '-score-output').addClass('calculated-score-fail');
                totalScoreClass = 'fail';
            }
            totalScore += score;
        });
        $('#total-score-output').val(totalScore);
        $('#total-score-output').addClass('calculated-score-' + totalScoreClass);
    });

    $('[id^=\'sprintDragCarryTime-\']').change(function(){
        $('#sprintDragCarry-score-input').val(parseInt($('#sprintDragCarryTime-minute').val() * 60) + parseInt($('#sprintDragCarryTime-second').val()));
        $('[id$=\'-score-output\']').val('');
        clearCalculatedScoreClasses();
    });

    $('[id^=\'twoMileRunTime-\']').change(function(){
        $('#twoMileRun-score-input').val(parseInt($('#twoMileRunTime-minute').val() * 60) + parseInt($('#twoMileRunTime-second').val()));
        $('[id$=\'-score-output\']').val('');
        clearCalculatedScoreClasses();
    });

    $('#clear-button').click(function(){
        $('[id$=\'-score-input\']').val('');
        $('[id$=\'-score-output\']').val('');
        clearCalculatedScoreClasses();
    });

    $('[id$=\'-score-input\']').change(function(){
        $('[id$=\'-score-output\']').val('');
        clearCalculatedScoreClasses();
    });
});

function clearCalculatedScoreClasses(){
    $('[id$=\'-score-output\']').removeClass(function (index, className) {
        return (className.match (/calculated-score-\S+/g) || []).join(' ');
    });
    $('[id$=\'-score-output\']').addClass('calculated-score-none');
}

function calculateScore(event, s){
    if(s === undefined || s === ""){ return 0; }
    let filteredScores = (scores[event].grades === undefined || scores[event].grades.length == 0) ? [] : getPossibleCalculatedScores(scores[event].grades, scores[event].goal, s);
    return (filteredScores === undefined || filteredScores.length == 0) ? 0 : Math.max.apply(Math, filteredScores);
}

function getPossibleCalculatedScores(scoresToFilter, goal, s){
    return scoresToFilter.filter(function(score){
        return scoreFilterOperators[goal](score.rawScore, s); 
    }).map(function(score) { 
        return score.calculatedScore; 
    });
}