let input_place = document.getElementById("i");
let output_place = document.getElementById("a");
let analyze_btn = document.getElementById("analyze-btn");

function findSubarray(arr, subarr) {
    for (var i = 0; i < 1 + (arr.length - subarr.length); i++) {
        var j = 0;
        for (; j < subarr.length; j++)
            if (arr[i + j] !== subarr[j])
                break;
        if (j == subarr.length)
            return i;
    }
    return -1;
}

function isPerfectTense(verbParse) {
    let rawText = verbParse.text || '';
    let terms = nlp(rawText).terms().json();
    let firstTermIsHaveHasOrHad = false;
    
    if (terms.length < 1) return false;
    
    if (terms[0].normal == "have") {
        cursor = rawText.indexOf("have") + 4;
        firstTermIsHaveHasOrHad = true;
    }
    if (terms[0].normal == "had") {
        cursor = rawText.indexOf("has") + 3;
        firstTermIsHaveHasOrHad = true;
    }
    if (terms[0].normal == "has") {
        cursor = rawText.indexOf("had") + 3;
        firstTermIsHaveHasOrHad = true;
    }
    
    let foundParticipleWords = false;
    for (let i = 1; i < terms.length; i++) {
        let verbData = nlp(terms[i].normal).verbs().json();
        
        if (verbData.length < 1) continue;
        
        const verb = verbData[0];
        if (verb.conjugation && verb.conjugation.Participle == terms[i].normal) {
            foundParticipleWords = true;
            break;
        }
    }
    
    return firstTermIsHaveHasOrHad && foundParticipleWords;
}

function wordsFromTokens(tokens) {
    let wordsList = [];
    for (token of tokens) {
        wordsList.push(token.normal || token.text || '');
    }
    return wordsList;
}

function drawSentence(tokensList) {
    output_place.innerHTML = "";
    
    for (token of tokensList) {
        let tokenEl = document.createElement("token");

        let tenseEl = document.createElement("tense");
        if (token.tense)
            tenseEl.innerHTML = token.tense;
        tokenEl.appendChild(tenseEl);
        
        let wordEl = document.createElement("word");
        wordEl.innerHTML = token.word || '-';
        tokenEl.appendChild(wordEl);
        if (token.tense)
            wordEl.className = "verb";

        output_place.appendChild(tokenEl);
    }
}

function getTense(verb) {
    // 获取动词原始形式
    const root = verb.root || verb.normal || verb.text || '';
    const text = verb.text || '';
    const normal = verb.normal || '';
    
    // 常见不规则动词的过去式列表
    const irregularPastForms = new Set([
        'went', 'ate', 'saw', 'took', 'came', 'knew', 'grew', 'drew',
        'flew', 'threw', 'spoke', 'drove', 'wrote', 'rode', 'rose',
        'ran', 'said', 'read', 'told', 'thought', 'made', 'found',
        'got', 'bought', 'brought', 'caught', 'taught', 'sat', 'won',
        'understood', 'stood', 'kept', 'slept', 'felt', 'left', 'meant',
        'sent', 'built', 'dealt', 'spent', 'bent', 'lent', 'broke',
        'chose', 'spoke', 'stole', 'woke', 'wore', 'tore'
    ]);

    // 检查不规则动词过去式
    if (irregularPastForms.has(normal)) {
        return 'Past';
    }

    // 检查是否有过去时标记
    if (verb.tags && (
        verb.tags.includes('PastTense') ||
        verb.tags.includes('Past')
    )) {
        return 'Past';
    }

    // 检查是否以 ed 结尾（规则动词过去式）
    if (normal.endsWith('ed') && !normal.endsWith('need')) {
        return 'Past';
    }
    
    // 检查特殊的过去时形式
    if (['was', 'were'].includes(normal)) {
        return 'Past';
    }
    
    // 检查将来时
    if (text.startsWith('will ') || text.startsWith('shall ')) {
        return 'Future';
    }

    // 检查时间标记词
    const doc = nlp(text);
    const terms = doc.terms().json();
    for (let term of terms) {
        if (term.tags && term.tags.includes('PastTense')) {
            return 'Past';
        }
    }
    
    return 'Present';
}

function analysisString(str) {
    // 先打印出动词分析结果，看看具体数据结构
    let verbs = nlp(str).verbs();
    let verbsParsingResult = verbs.json();
    console.log("Verbs parsing result:", verbsParsingResult);
    console.log("Raw verbs data:", verbs.data());

    // 获取所有词
    let parsedTerms = nlp(str).terms().json();
    
    let verbTenses = [];
    for (let verbParse of verbsParsingResult) {
        let text = verbParse.text || '';
        let normal = verbParse.normal || '';
        
        // 打印每个动词的详细信息
        console.log("Processing verb:", {
            text: text,
            normal: normal,
            tags: verbParse.tags,
            terms: nlp(text).terms().json()
        });

        // 基于动词的形态来判断时态
        let doc = nlp(text);
        let verbData = doc.verbs().conjugate()[0];
        console.log("Verb conjugation:", verbData);

        let tense = 'Present'; // 默认时态

        // 检查过去式
        if (verbData && (
            text === verbData.PastTense ||
            normal === verbData.PastTense
        )) {
            tense = 'Past';
        }
        // 检查将来时
        else if (text.startsWith('will ') || text.startsWith('shall ')) {
            tense = 'Future';
        }

        // 检查其他特征
        let isPassive = text.includes('been ') || text.includes('being ');
        let isPerfect = /\b(have|has|had)\b/.test(text);
        let isContinuous = text.includes('ing');

        let tagPerfect = isPerfect ? " Perfect " : " ";
        let tagPassive = isPassive ? "Passive " : "";
        let tagCon = isContinuous ? "Continuous " : "";
        
        verbTenses.push(tagPassive + tense + tagPerfect + tagCon);
    }
    
    // 构建基本 tokens
    let tokens = [];
    let lowestIndex = 0;
    for (let term of parsedTerms) {
        let token = {};
        let termText = term.text || '';
        lowestIndex += str.substring(lowestIndex, str.length).indexOf(termText);
        token.indexStart = lowestIndex;
        token.word = termText;
        token.normal = term.normal || termText;
        lowestIndex += termText.length;
        token.indexEnd = lowestIndex;
        tokens.push(token);
    }
    
    // 处理动词
    let wordsList = wordsFromTokens(tokens);
    let verbTexts = verbs.text();
    let verbWords = verbTexts.split(' ');
    
    for (let j = 0; j < verbsParsingResult.length; j++) {
        let verbText = verbsParsingResult[j].text || '';
        let verbWordsList = verbText.split(' ');
        let verbTense = verbTenses[j];
        
        let i = findSubarray(wordsList, verbWordsList);
        
        if (i < 0) continue;
        
        tokens.splice(i, verbWordsList.length, {
            indexStart: tokens[i].indexStart,
            indexEnd: tokens[i + verbWordsList.length - 1].indexEnd,
            word: verbText,
            normal: verbText.toLowerCase(),
            tense: verbTense
        });

        wordsList = wordsFromTokens(tokens);
    }
    
    return tokens;
}

function eventFunct() {
    let str = input_place.value;
    let tokensDataPackage = analysisString(str);
    drawSentence(tokensDataPackage);
}

analyze_btn.addEventListener("click", eventFunct);