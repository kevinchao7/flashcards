var inquirer  = require('inquirer');
var BasicCard = require('./BasicCard.js');
var ClozeCard = require('./ClozeCard.js');
var fs        = require('fs');

var database = [];
var dbArray = ['Edit','Delete'];
var menuStates = [
                    {
                      type    :   'list',
                      choices :  ['Create Flash Cards','Read Flash Cards'],
                      message :   'Choose Options: ',
                      back    :   undefined
                    },
                    {
                      type    :   'list',
                      choices :  ['Cloze','Basic'],
                      message :   'What card would you like to create?',
                      back    :    0
                    },
                    {
                      type    :  'message',
                      message :  'Please enter a front for your basic card.'
                    }
                 ];

load(); // Initializes the program.

function load(){
  if (database.length == 0){
    loadDatabase();
  }
  run();
}

function run(){
  runMenuState(0,'list',(resp)=>{
    if (resp == menuStates[0].choices[0]){
      // Create Flash Cards
      runMenuState(1, 'list',(resp)=>{
        // Create Cloze Card
        if (resp == menuStates[1].choices[0]){
          inquireCloze( (resp)=>{ saveToDatabase('cloze',resp.fullText,resp.cloze)} );
        }
        // Create Basic Card
        else{
          inquireBasic( (resp)=>{ saveToDatabase('basic',resp.front,resp.back) });
        }
      });
    }
    // Read/Edit Flash Cards
    else {
      displayCards();
    }
  });
}

function displayCards(){
  var db = [];
  database.forEach((value,index)=>{
    db.push((value.front || value.partialText) + ' - ' + value.type + ' card');
  });
  inquirer.prompt([
    {
      type: "list",
      message: "Select your card. ",
      choices: db,
      name: "card"
    }
  ]).then((resp)=>{
    if(resp.card.indexOf('cloze') !=-1){
      readCard(resp.card,'cloze');
    }
    else{
      readCard(resp.card,'basic');
    }
  });
}

function readCard(card,type){
  var actualCard = card.replace(' - ' + type +' card','');
  for (var i = 0; i < database.length; i++){
    if(database[i].type == 'cloze'){
      if (actualCard == database[i].partialText){
        loadFlashCard(database[i].partialText, database[i].cloze,'cloze');
        return;
      }
    }
    else {
      if (actualCard == database[i].front){
        loadFlashCard(database[i].front,database[i].back,'basic');
        return;
      }
    }
  }
}

function loadFlashCard(textA,textB,type){
  inquireMessage((type == 'basic') ? 'What/Who was ' + textA + '?' : 'Fill in the dots => ' + textA,(resp)=>{
    if(resp == textB){
      console.log('You were correct!');
    }
    else {
      console.log('You were incorrect!');
    }
  });
}

function saveToDatabase(type, textA, textB){
  var tmpObj;
  if (type == 'cloze'){
    tmpObj = new ClozeCard(textA,textB);
  }
  else{
    tmpObj = new BasicCard(textA,textB);
  }
  database.push(tmpObj);
  fs.writeFile('log.txt',JSON.stringify(database),()=>{});
}

function runMenuState(state, type = 'message', callBackFunc = ()=>{} ){
  if (type == 'list'){
    inquireList(menuStates[state].message, menuStates[state].choices, callBackFunc);
  }
  else{
    inquireMessage(menuStates[state].message,callBackFunc);
  }
}

function loadDatabase(){
  fs.stat('log.txt',(err,stats)=>{
    if (err){
      throw err;
    }else{
      fs.readFile('log.txt','utf8',(err,data)=>{
        if (data.length > 1){
          database = JSON.parse(data);
        }
        // console.log(JSON.stringify(database,null,4));
      });
    }
  });
}

function inquireMessage(yourMessage, doFunc){
  inquirer.prompt([
    {
      type    : 'input',
      message : yourMessage,
      name    : 'objName'
    }
  ]).then(resp=>{
    doFunc(resp['objName']);
  });
}

function inquireBasic(doFunc){
  inquirer.prompt([
    {
      type    : 'input',
      message : 'Enter text for the front of your card.',
      name    : 'front'
    },
    {
      type    : 'input',
      message : 'Enter text for the back of your card.',
      name    : 'back'
    }
  ]).then(resp=>{
    doFunc(resp);
  });
}

function inquireCloze(doFunc){
  inquirer.prompt([
    {
      type    : 'input',
      message : 'Enter the full text for your card.',
      name    : 'fullText'
    },
    {
      type    : 'input',
      message : 'Enter partial text for your card to be hidden.',
      name    : 'cloze'
    }
  ]).then(resp=>{
    doFunc(resp);
  });
}

function inquireList(yourMessage, choiceList, doFunc){
  inquirer.prompt([
    {
      type    : 'list',
      message : yourMessage,
      choices : choiceList,
      name    : 'objName'
    }
  ]).then(resp=>{
    doFunc(resp['objName']);
  });
}
