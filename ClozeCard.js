// var firstPresidentCloze = new ClozeCard(
//     "George Washington was the first president of the United States.", "George Washington");

var ClozeCard = function(fullText, cloze){
  this.fullText    = fullText;
  this.cloze       = cloze;
  this.partialText = fullText.replace(cloze,'...');
  this.type        = 'cloze';
}

module.exports = ClozeCard;
