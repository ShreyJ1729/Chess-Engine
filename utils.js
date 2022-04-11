const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
  return array;
};

const getLetterFrequency = (string) => {
  var freq = {};
  for (var i = 0; i < string.length; i++) {
    var character = string.charAt(i);

    // only count alphabets
    let ascii = string.charCodeAt(i);
    if (!((ascii >= 65 && ascii <= 90) || (ascii >= 97 && ascii <= 122)))
      continue;

    if (freq[character]) {
      freq[character]++;
    } else {
      freq[character] = 1;
    }
  }

  return freq;
};

const isCapital = (ch) => {
  return ch.charCodeAt() >= 65 && ch.charCodeAt() <= 90;
};