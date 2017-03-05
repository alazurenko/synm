#!/usr/bin/env node
const chalk = require('chalk');
const request = require('request');
const command = require('commander');
const cfg = require('./config');
const log = console.log;

// App constants
const API_KEY = cfg.apiKey;
const WORDS_PER_LINE = 4;
const LONG_LINE = '--------------------------------------------------';
const NOT_FOUND = 'Sorry, no such word in dictionary.';

// Styles for console output
let heading = chalk.white.bgBlack.underline.bold;
let text = chalk.yellow

/**
 * Creates a text based on a given array of words 
 * @param {Array} arr - Array of words
 * @returns {String}
 */
function prepareText(arr) {
    return arr.reduce((prev, current, idx, arr) => { 
        // If word is last don't put comma, also separate lines with WORDS_PER_LINE
        let isLineBreak = ((idx % WORDS_PER_LINE === 0) && (idx !== 0)) ? true : false;
        let separator = (idx === arr.length - 1) ? '' : `,  ${(isLineBreak) ? '\n' : ''}`;
        return prev += `${current}${separator}`
    }, '');
}

/**
 * Prints synonyms to the console
 * @param {String} title - Heading of a paragraph 
 * @param {Array} arr - Array of associated words
 */
function print(title, arr) {
    if(!arr) { return }
    let synonyms = arr.syn;
    let antonyms = arr.ant;

    log('');
    log(heading(title), LONG_LINE);
    log(text(prepareText(synonyms)));
    if(antonyms) {
        log(heading('Antonyms'));
        log(text(prepareText(antonyms)));
    }
    log('');
}

/**
 * Handles response from API
 * @param {Object} err 
 * @param {Object} res 
 * @param {String} body 
 */
function handleResponse(err, res, body) {
    if(err) { log(err) }

    if(body) {
        let data = JSON.parse(body);
        print('Nouns', data.noun);
        print('Verbs', data.verb)
    } else {
        log(text(NOT_FOUND));
    }
}
/**
 * Makes URL to the api with a give word
 * @param {String} word
 * @returns {String} - Constructed url 
 */
let makeUrl = word => `${ cfg.api }/${ cfg.version }/${ API_KEY }/${ word }/${ cfg.format }`;

/**
 * Makes a call to API with a given word
 * @param {String} word 
 */
function lookup(word) {
    request(makeUrl(word), handleResponse);    
}

// Register commands for cli
command
    .arguments('word')
    .action(lookup)
    .parse(process.argv)
