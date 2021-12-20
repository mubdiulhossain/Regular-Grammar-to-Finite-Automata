
var states = []; //this is all the states that contains the State object . it contains data for next state and transition.
var totalStates = []; // all the states found
var totalTransitions = []; // all the transitions found
var finalStates = []; //final states upto nfa we.

var DFAStates = []; // list of states for dfa
var dfaFinalStates = []; // list of final states for dfa

var MinimizedDFAStates = []; //minimized dfa states.
var MinimizedDfaFinalStates = []; //minimized dfa final states.
var MinimizedDfaStartState = ""; // minimized dfa start state.

var startState = ''; // start state until dfa.

var invalidFormat = false; //if error occurs this value should be true

var leftSideDiv = document.createElement("div"); // division for showing the start, final states, functions, etc.
leftSideDiv.setAttribute('class', 'p-2 bd-highlight align-self-center justify-content-center');
leftSideDiv.setAttribute('id', 'leftSideOfMainView');

var rightSideDiv = document.createElement("div"); // division for showing the table.
rightSideDiv.setAttribute('class', 'p-2 bd-highlight');
rightSideDiv.setAttribute('id', 'rightSideOfMainView');

var mainView = document.getElementById('mainView');
//mainView.innerHTML = "";

var mainViewContainer = document.createElement("div"); // division for showing the table.
mainViewContainer.setAttribute('class', 'd - flex flex - row bd - highlight mb - 3');
mainViewContainer.setAttribute('id', 'mainViewContainer');


function convertRG() { //this function's sole purpose is to generate the states from the textfield.


    var inputString = document.getElementById("inputString").value;
    var listOfRGs = inputString.split(/\n|\s/);

    listOfRGs = listOfRGs.filter(Boolean);
    //reset data from here
    states = [];
    totalStates = [];
    totalTransitions = [];
    finalStates = [];

    DFAStates = [];
    dfaFinalStates = [];

    MinimizedDfaFinalStates = [];
    MinimizedDFAStates = [];
    MinimizedDfaStartState = "";
    startState = '';
    invalidFormat = false;

    mainView.innerHTML = '';
    leftSideDiv.innerHTML = '';
    rightSideDiv.innerHTML = '';
    mainViewContainer.innerHTML = '';

    //reset data finished.

    if (listOfRGs.length == 0) {
        invalidFormat = true;
    }
    //console.log(listOfRGs);
    for (let i = 0; i < listOfRGs.length; i++) { //now we look into each string

        if (listOfRGs[i].charAt(0) >= 'A' && listOfRGs[i].charAt(0) <= 'Y') { //matching the first character, which is the State name.

            var transitionSplit = listOfRGs[i].slice(3, listOfRGs[i].length).split('|'); // splitting the rest of the strings

            for (let j = 0; j < transitionSplit.length; j++) { // now we loop through each transition to point next state

                var transition = null; // transition in this state, if the transition is null system will mark it as epsilon state
                var nextState = null;  // next State from this state

                if (transitionSplit[j].charAt(0) >= '0' && transitionSplit[j].charAt(0) <= '9' && transitionSplit[j] != 'e') { //checking if it is a transtion for first character after arrow sign.
                    transition = transitionSplit[j].charAt(0); // setting transition
                }
                else {
                    if (transitionSplit[j].charAt(0) >= 'A' && transitionSplit[j].charAt(0) <= 'Y') { //checking if it is a transtion for first character after arrow sign.
                        nextState = transitionSplit[j].charAt(0); // setting next state
                    }
                    else {
                        if (transitionSplit[j].charAt(0) == 'e') { //checking epsilon
                            finalStates.push(listOfRGs[i].charAt(0));
                            transition = 'e';
                        }
                        else {
                            invalidFormat = true;
                        }
                    }
                }

                if (!invalidFormat && transition != null && nextState == null) { // if there is a transition but no state found in index 1 we assign next state from index 2.eg. S->aB
                    if (transitionSplit[j].charAt(1) >= 'A' && transitionSplit[j].charAt(1) <= 'Z') {
                        nextState = transitionSplit[j].charAt(1);
                    }
                    else {
                        if (transition != 'e' && nextState == null) { // if transition exists end but no state, we assign current state. eg S->a
                            nextState = listOfRGs[i].charAt(0);
                        }
                    }
                }

                if (!invalidFormat) { //checking if format was wrong
                    if (startState == '') {
                        startState = listOfRGs[i].charAt(0);
                    }
                    states.push(new State(transition, nextState, listOfRGs[i].charAt(0))); // putting all the state data to state object list
                    if (transition != null && !totalTransitions.includes(transition) && transition != 'e') { // putting new found transition in the total transition list
                        totalTransitions.push(transition);
                    }
                    if (!totalStates.includes(listOfRGs[i].charAt(0))) {// putting new found state in the total State list
                        totalStates.push(listOfRGs[i].charAt(0));
                    }
                }
            }
        }
        else {
            invalidFormat = true;
            if (invalidFormat) {
                alert("The format is invalid");
            }
            return;
        }

    }

    totalTransitions.sort();
    totalStates.sort();

    /* for debug purposes
    for (i = 0; i < states.length; i++) {
        console.log(states[i]);
    }
    for (i = 0; i < totalStates.length; i++) {
        console.log(totalStates[i]);
    }
    totalStates = totalStates.sort();
    totalTransitions = totalTransitions.sort();
    for (i = 0; i < totalTransitions.length; i++) {
        console.log(totalTransitions[i]);
    }*/
    if (invalidFormat) {
        alert("The format is invalid");
    }
}

function convertRGtoNFA() { // this function is called when NFA button is pressed.
    convertRG();

    if (!invalidFormat) {
        let table = generateNFATable(); //generate an nfa table

        var nfaMap = getNfaMap();

        for (let [k, v] of nfaMap) { //k is state id+ transition, e.g. A_b v is array of next states
            var splitStateID = k.split("_");

            var stateIndex = totalStates.indexOf(splitStateID[0]);
            var transitionIndex;
            let isThisFinal = false;

            if (splitStateID[1] != "epsln") {
                if (splitStateID[1] == 'e') {
                    isThisFinal = true;
                }
                else {
                    transitionIndex = totalTransitions.indexOf(splitStateID[1]);
                }
            }
            else {
                transitionIndex = totalTransitions.indexOf('e');
            }
            if (!isThisFinal) {
                let elementsState = "";
                for (i = 0; i < v.length; i++) {
                    if (i == 0) {
                        elementsState += "{";
                    }
                    elementsState += v[i];

                    if (i != v.length - 1) {
                        elementsState += ",";
                    }
                }
                elementsState += "}";
                table.rows[stateIndex + 1].cells[transitionIndex + 1].innerHTML = elementsState;
            }
            else {
                table.rows[stateIndex + 1].cells[0].innerHTML = "*" + splitStateID[0];
            }
            if (startState == splitStateID[0]) {
                table.rows[stateIndex + 1].cells[0].innerHTML = "➝" + splitStateID[0];
                if (isThisFinal) {
                    table.rows[stateIndex + 1].cells[0].innerHTML = "➝" + splitStateID[0] + "*";
                }
            }
        }

        //todo: show all the starts states inside leftSideDiv
        leftSideDiv.innerHTML = "M = (Q,∑,δ,p0,F)" + "<br>" + "Q = {" + totalStates.join() + "}" + "<br>" + "∑ = {" + totalTransitions.join() + "}" + "<br>" + "δ = Q x ∑ -> Pow(Q)" + "<br>" + "P0 = {" + startState + "}" + "<br>" + "F = {" + finalStates + "}";

        //leftSideDiv.appendChild(table); // adding values to left side
        rightSideDiv.appendChild(table); // adding table to right side

        mainViewContainer.appendChild(leftSideDiv);
        mainViewContainer.appendChild(rightSideDiv);

        mainView.appendChild(mainViewContainer);

    }
    else {
        mainView.innerHTML = "Please enter correct Regular expression!";
    }

}
function nfaWOEP() { // we convert the NFA with epsilon to NFA without epsilon here.
    convertRG();
    if (!invalidFormat) {
        let nfaWOepMap = nfaWOeMap(); // returning NFA without epsilon map.

        var table = generateNFAWETable();

        for (let [k, v] of nfaWOepMap) { //k is state id+ transition, e.g. A_b v is array of next states
            var splitStateID = k.split("_");

            var stateIndex = totalStates.indexOf(splitStateID[0]);
            var transitionIndex = totalTransitions.indexOf(splitStateID[1]);

            if (splitStateID[1] != "e") {
                let elementsState = "";
                for (i = 0; i < v.length; i++) {
                    if (i == 0) {
                        elementsState += "{";
                    }
                    elementsState += v[i];

                    if (i != v.length - 1) {
                        elementsState += ",";
                    }
                }
                elementsState += "}";
                table.rows[stateIndex + 1].cells[transitionIndex + 1].innerHTML = elementsState;

            }
        }
        for (let i = 0; i < totalStates.length; i++) {
            if (finalStates.includes(totalStates[i])) {
                table.rows[i + 1].cells[0].innerHTML += "*";
            }
            if (startState == totalStates[i]) {
                table.rows[i + 1].cells[0].innerHTML = "➝" + table.rows[i + 1].cells[0].innerHTML;
            }
        }
        //todo: show all the starts states inside leftSideDiv
        leftSideDiv.innerHTML = "M = (Q,∑,δ,p0,F)" + "<br>" + "Q = {" + totalStates.join() + "}" + "<br>" + "∑ = {" + totalTransitions.join() + "}" + "<br>" + "δ = Q x ∑ -> Pow(Q)" + "<br>" + "P0 = {" + startState + "}" + "<br>" + "F = {" + finalStates.join() + "}";
        //leftSideDiv.appendChild(table); // adding values to left side
        rightSideDiv.appendChild(table); // adding table to right side

        mainViewContainer.appendChild(leftSideDiv);
        mainViewContainer.appendChild(rightSideDiv);

        mainView.appendChild(mainViewContainer);
    }
    else {
        mainView.innerHTML = "Please enter correct Regular expression!";
    }
}
function nfaToDFA() //
{
    convertRG();

    if (!invalidFormat) {
        let finalDFA = dfaStates();
        console.log(dfaFinalStates);
        var table = generateDFATable(DFAStates, totalTransitions);

        for (let [k, v] of finalDFA) {

            let splitK = k.split("_");

            let indexOfState = DFAStates.indexOf(splitK[0]);

            let indexOfTransition = totalTransitions.indexOf(splitK[1]);

            let elementsState = v.join();

            table.rows[indexOfState + 1].cells[indexOfTransition + 1].innerHTML = elementsState;

        }
        for (let i = 0; i < DFAStates.length; i++) {
            if (dfaFinalStates.includes(DFAStates[i])) {
                table.rows[i + 1].cells[0].innerHTML += "*";
            }
            if (startState == DFAStates[i]) {
                table.rows[i + 1].cells[0].innerHTML = "➝" + table.rows[i + 1].cells[0].innerHTML;
            }
        }


        mainView.appendChild(table);
    }
    else {
        mainView.innerHTML = "Please enter correct Regular expression!";
    }

    //console.log();

}
function minimizeDFA() { // when MinDFA button is pressed this function is called.

    convertRG(); // we start from very beginning to convert the Regular expression to NFA->NFA without e->DFA.

    if (!invalidFormat) {

        let minimizedDFA = minimizeDFAAction(); // then we calculate minimization of the dfa

        var table = generatedMinimizedDFATable()

        for (let [k, v] of minimizedDFA) {

            let splitK = k.split("_");

            let indexOfState = MinimizedDFAStates.indexOf(splitK[0]);

            let indexOfTransition = totalTransitions.indexOf(splitK[1]);

            table.rows[indexOfState + 1].cells[indexOfTransition + 1].innerHTML = v;

        }
        for (let i = 0; i < MinimizedDFAStates.length; i++) {
            if (MinimizedDfaFinalStates.includes(MinimizedDFAStates[i])) {
                table.rows[i + 1].cells[0].innerHTML += "*";
            }
            if (MinimizedDfaStartState == MinimizedDFAStates[i]) {
                table.rows[i + 1].cells[0].innerHTML = "➝" + table.rows[i + 1].cells[0].innerHTML;
            }
        }

        mainView.appendChild(table);
    }
    else {
        mainView.innerHTML = "Please enter correct Regular expression!";
    }
}
function testMinimizedDFA() { // checkin input strings will be done here.


    let minimizedDFA = minimizeDFAAction();

    for (let i = 0; i < 5; i++) {
        let inputCheckString = document.getElementById("checkStrings" + i).value;

        let cleanString = inputCheckString.replace(/\s|\n/g, "");

        let showResultDiv = document.getElementById('inputStringsImageDiv' + i);
        showResultDiv.innerHTML = '';

        if (cleanString.length != 0) {

            let isAccepted = getTestResult(minimizedDFA, cleanString);
            console.log(isAccepted);


            let imageSource = document.createElement('img');
            let textStatus = document.createElement('p');
            imageSource.setAttribute('id','checkedStatus'+i);
            imageSource.setAttribute('alt', "Checked");
            imageSource.style.width = "30px";
            imageSource.style.height = "30px";
            //imageSource.style.float = "right";
            if (isAccepted) {
                imageSource.src = "images/check.svg";
                textStatus.innerHTML = "OK";
            }
            else {
                imageSource.src = "images/x.svg";
                textStatus.innerHTML = "NO";
            }
            textStatus.appendChild(imageSource);
            showResultDiv.style.display = "block";

            showResultDiv.appendChild(textStatus);
            //showResultDiv.appendChild(imageSource);
        }
    }
    console.log(minimizedDFA);
}

function getNfaMap() { // from this function we recieve a Map which holds the state+"_"+transition as key. array of next states as values.
    var nfaMap = new Map(); // we use a map to identify which state+transition goes where. Each map's value is an array containing the next states

    for (i = 0; i < states.length; i++) {
        var combinedValue; //combining stateName+transition in this var
        var transArray = []; // list of all the next states will be stored here
        if (states[i].nextState != null) {
            transArray.push(states[i].nextState);
        }
        if (states[i].transition != null) {
            combinedValue = (states[i].stateID + "_" + states[i].transition);
        }
        else {
            combinedValue = (states[i].stateID + "_epsln");
        }

        if (!nfaMap.has(combinedValue)) {
            nfaMap.set(combinedValue, transArray);
        }
        else {
            nfaMap.set(combinedValue, nfaMap.get(combinedValue).concat(transArray));
        }
    }
    console.log(nfaMap);
    return nfaMap;

}
function nfaWOeMap() {

    let nfaWOepMap = new Map();

    for (let i = 0; i < states.length; i++) {
        var combinedValue; //combining stateName+transition in this var
        var transArray = []; // list of all the next states will be stored here
        if (states[i].nextState != null) {
            transArray.push(states[i].nextState);
        }
        if (states[i].transition != null) {
            combinedValue = (states[i].stateID + "_" + states[i].transition);
            if (!nfaWOepMap.has(combinedValue)) {
                nfaWOepMap.set(combinedValue, transArray);
            }
            else {
                nfaWOepMap.set(combinedValue, nfaWOepMap.get(combinedValue).concat(transArray));
            }
        }
        else {
            for (let j = 0; j < states.length; j++) {
                if (states[j].nextState == states[i].stateID && states[j].transition != null) {
                    combinedValue = (states[j].stateID + "_" + states[j].transition);
                    console.log(combinedValue);
                    if (!nfaWOepMap.has(combinedValue)) {
                        nfaWOepMap.set(combinedValue, transArray);
                    }
                    else {
                        nfaWOepMap.set(combinedValue, nfaWOepMap.get(combinedValue).concat(transArray));
                    }
                }
            }
        }
    }
    //this part is for reaching to same state by epsilon
    for (let i = 0; i < states.length; i++) {
        if (states[i].transition == null && states[i].nextState != null) {

            let transArray = [];

            for (let j = 0; j < states.length; j++) {
                if (states[i].nextState == states[j].stateID) {
                    if (states[j].nextState == states[i].stateID && states[j].transition != null) {
                        if (!transArray.includes(states[i].stateID)) {
                            transArray.push(states[i].stateID);

                        }
                        if (!transArray.includes(states[j].stateID)) {
                            transArray.push(states[j].stateID);
                        }
                        if (finalStates.includes(states[j].stateID)) {
                            if (!finalStates.includes(states[i].stateID)) {
                                finalStates.push(states[i].stateID);
                            }
                        }
                        console.log(finalStates);
                        if (nfaWOepMap.has(states[j].nextState + "_" + states[j].transition)) {
                            transArray = union_arrays(transArray, nfaWOepMap.get(states[j].nextState + "_" + states[j].transition));

                            nfaWOepMap.set(states[i].stateID + "_" + states[j].transition, transArray);
                        }
                        else {
                            nfaWOepMap.set(states[i].stateID + "_" + states[j].transition, transArray);
                        }
                    }

                }
            }

        }
    }
    //console.log(nfaWOepMap);
    for (let [k, v] of nfaWOepMap) {
        v = v.sort();
        nfaWOepMap.set(k, v);
    }
    return nfaWOepMap;
}
function dfaStates() {  //convert nfaWE to dfa states object list for further calculation

    var nfaWeMap = nfaWOeMap();

    let dfaTempMap = new Map();

    dfaFinalStates = finalStates;

    let dFAStatesList = [];

    for (let [k, v] of nfaWeMap) {
        dfaTempMap.set(k, v);
    }

    for (let i = 0; i < totalStates.length; i++) {
        dFAStatesList.push(totalStates[i]);
        for (j = 0; j < totalTransitions.length; j++) {

            let tempArray = [];

            if (nfaWeMap.has(totalStates[i] + "_" + totalTransitions[j])) {
                tempArray = nfaWeMap.get(totalStates[i] + "_" + totalTransitions[j]);
            }

            dfaTempMap.set(totalStates[i] + "_" + totalTransitions[j], tempArray);
        }

    }

    for (let [k, v] of dfaTempMap) { //merging all the elements

        if (v.length > 1) {

            let combine = "";
            v = v.sort()
            for (i = 0; i < v.length; i++) {
                combine += v[i];

                if (v.length - 1 != i) {
                    combine += ",";
                }
            }
            if (dFAStatesList.indexOf(combine) == -1) {
                dFAStatesList.push(combine);

                let splitCombine = combine.split(",");

                let isThisFinalState = false;

                for (i = 0; i < splitCombine.length; i++) {
                    if (dfaFinalStates.indexOf(splitCombine[i]) !== -1) {
                        isThisFinalState = true;
                        break;
                    }
                }
                if (isThisFinalState) {
                    dfaTempMap.set(combine + "_e", []);
                    if (!dfaFinalStates.includes(combine)) {
                        dfaFinalStates.push(combine);
                    }
                }

                for (i = 0; i < totalTransitions.length; i++) {
                    let stateTra = combine + "_" + totalTransitions[i];
                    let char = combine.split(",");

                    let array = [];

                    for (j = 0; j < char.length; j++) {
                        array = union_arrays(array, dfaTempMap.get(char[j] + "_" + totalTransitions[i]));
                    }
                    array = array.sort();

                    dfaTempMap.set(stateTra, array);

                }
            }
        }

    }

    for (let [k, v] of dfaTempMap) { // adding Z to non states

        let splitK = k.split("_");

        if (splitK[1] != "e") {
            if (v.length == 0) {
                v.push('Z');
                dfaTempMap.set(k, v);
            }
        }
    }

    dFAStatesList.push("Z");

    for (i = 0; i < totalTransitions.length; i++) {
        let arrayZ = [];
        arrayZ.push('Z');
        dfaTempMap.set("Z_" + totalTransitions[i], arrayZ);
    }

    let finalDFA = removeUnreachables(dFAStatesList, dfaTempMap);

    return finalDFA;
}
function minimizeDFAAction() {

    let dfas = dfaStates(); // we calculate the dfa states where NFA, NFA w/o e is already called..

    let dfaFinalStateForMin = dfaFinalStates;
    let DFAStatesForMin = DFAStates;
    let totalTransitionForMin = totalTransitions;

    let dfaNonFinalStates = arr_diff(dfaFinalStateForMin, DFAStatesForMin);

    let equivalanceArray = [];

    equivalanceArray.push(dfaNonFinalStates);
    equivalanceArray.push(dfaFinalStateForMin);

    let newDFAeq = equivalanceArray;

    let shouldWeGoOne = true;

    while (shouldWeGoOne) {
        let pastLength = newDFAeq.length;
        newDFAeq = nextEqMinDFA(newDFAeq, dfas);
        let currentLength = newDFAeq.length;
        if (pastLength == currentLength) {
            shouldWeGoOne = false;
        }
    }
    MinimizedDFAStates = [];
    MinimizedDfaFinalStates = [];
    MinimizedDfaStartState = "";

    for (let i = 0; i < newDFAeq.length; i++) {
        for (let j = 0; j < newDFAeq[i].length; j++) {
            if (dfaFinalStateForMin.includes(newDFAeq[i][j])) {
                let newMinmizedState = newDFAeq[i].join();
                if (!MinimizedDfaFinalStates.includes(newMinmizedState)) {
                    MinimizedDfaFinalStates.push(newMinmizedState);
                }
            }
            if (startState == newDFAeq[i][j]) {
                MinimizedDfaStartState = newDFAeq[i].join();
            }
            let newState = newDFAeq[i].join();
            if (!MinimizedDFAStates.includes(newState)) {
                MinimizedDFAStates.push(newState);
            }
        }
    }

    let newMinimizedDFA = new Map();

    for (let i = 0; i < newDFAeq.length; i++) {
        let joinedState = newDFAeq[i].join();

        for (let j = 0; j < totalTransitionForMin.length; j++) {
            let statesTo = dfas.get(newDFAeq[i][0] + "_" + totalTransitionForMin[j]);
            let statesToID = statesTo.join();

            //console.log(joinedState + "-" + statesToID + ", " + statesTo);
            for (let k = 0; k < newDFAeq.length; k++) {
                if (newDFAeq[k].includes(statesToID)) {

                    let joinNextState = newDFAeq[k].join();

                    newMinimizedDFA.set(joinedState + "_" + totalTransitionForMin[j], joinNextState);

                }
            }

        }
    }
    return newMinimizedDFA;
}
function getTestResult(minimizedDFA, cleanString) { // input string true or false is decided here.

    let isInputPass = false;

    MinimizedDFAStates; //minimized dfa states.
    MinimizedDfaFinalStates; //minimized dfa final states.
    MinimizedDfaStartState;
    totalTransitions;

    let currentState = MinimizedDfaStartState;

    console.log(totalTransitions);

    for (let i = 0; i < cleanString.length; i++) {

        if (totalTransitions.includes(cleanString[i])) {

            currentState = minimizedDFA.get(currentState + "_" + cleanString[i]);

            if (cleanString.length - 1 == i) {
                if (MinimizedDfaFinalStates.includes(currentState)) {
                    console.log("Last Traveled State: "+currentState);
                    return true;
                }
            }
        }
        else {
            if (cleanString[i] == 'e') {

                if (MinimizedDfaFinalStates.includes(currentState) && cleanString.length-1==i) {
                    return true;
                }
            }
            else {
                return false;
            }
        }
    }
    return isInputPass;
}

function generateNFATable() { // generate the NFA with epsilon table.
    let table = document.createElement('table');
    table.setAttribute('id', 'nfaTable');

    totalTransitions.push('e'); //we put an epsilon transition for nfa with e table.

    for (var i = 0; i <= totalStates.length; i++) {

        var newRow = table.insertRow(table.length);

        for (var j = 0; j <= totalTransitions.length; j++) {

            var cell = newRow.insertCell(j);
            //cell.style.display = "inline-block";
            if (j == 0 && i > 0) {
                cell.innerHTML = totalStates[i - 1];
            }
            else {
                if (j > 0 && i == 0) {
                    cell.innerHTML = totalTransitions[j - 1];
                }
                else {
                    if (i == 0 && j == 0) {
                        cell.innerHTML = "";
                    }
                    else {
                        cell.innerHTML = "{}";
                    }
                }
            }
        }
    }
    return table;
}
function generateNFAWETable() { // generate the NFA without epsilon table

    let table = document.createElement('table');
    table.setAttribute('id', 'nfaweTable');

    for (var i = 0; i <= totalStates.length; i++) {

        var newRow = table.insertRow(table.length);

        for (var j = 0; j <= totalTransitions.length; j++) {

            var cell = newRow.insertCell(j);

            if (j == 0 && i > 0) {
                cell.innerHTML = totalStates[i - 1];
            }
            else {
                if (j > 0 && i == 0) {
                    cell.innerHTML = totalTransitions[j - 1];
                }
                else {
                    if (i == 0 && j == 0) {
                        cell.innerHTML = "";
                    }
                    else {
                        cell.innerHTML = "{}";
                    }
                }
            }
        }
    }
    return table;
}
function generateDFATable(states, transitions) { // drawing dfa table
    let table = document.createElement('table');
    table.setAttribute('id', 'dfaTable');

    for (var i = 0; i <= states.length; i++) {

        var newRow = table.insertRow(table.length);

        for (var j = 0; j <= transitions.length; j++) {

            var cell = newRow.insertCell(j);

            if (j == 0 && i > 0) {
                cell.innerHTML = states[i - 1];
            }
            else {
                if (j > 0 && i == 0) {
                    cell.innerHTML = transitions[j - 1];
                }
                else {
                    if (i == 0 && j == 0) {
                        cell.innerHTML = "";
                    }
                    else {
                        cell.innerHTML = "{}";
                    }
                }
            }
        }
    }
    return table;
}
function generatedMinimizedDFATable() { // generating a table for the minimized dfa.

    let table = document.createElement('table');
    table.setAttribute('id', 'minDfaTable');

    for (var i = 0; i <= MinimizedDFAStates.length; i++) {

        var newRow = table.insertRow(table.length);

        for (var j = 0; j <= totalTransitions.length; j++) {

            var cell = newRow.insertCell(j);

            if (j == 0 && i > 0) {
                cell.innerHTML = MinimizedDFAStates[i - 1];
            }
            else {
                if (j > 0 && i == 0) {
                    cell.innerHTML = totalTransitions[j - 1];
                }
                else {
                    if (i == 0 && j == 0) {
                        cell.innerHTML = "";
                    }
                    else {
                        cell.innerHTML = "{}";
                    }
                }
            }
        }
    }
    return table;

}

function removeUnreachables(dFAStatesList, dfaTempMap) { // this function remove unreachable states. four times.

    let finalDFA;
    let onMoreTempMap = dfaTempMap;
    let oneMorefinalDFAStates = dFAStatesList;

    let newDFAFinalStates = [];
    //console.log(dfaFinalStates);

    for (m = 0; m < 4; m++) {
        finalDFA = new Map();

        DFAStates = [];
        newDFAFinalStates = []
        for (let i = 0; i < oneMorefinalDFAStates.length; i++) {
            if (oneMorefinalDFAStates[i] != startState) {

                for (k = 0; k < oneMorefinalDFAStates.length; k++) {
                    if (i != k) {

                        let isReachable = false;
                        for (j = 0; j < totalTransitions.length; j++) {

                            let arrayJoin = onMoreTempMap.get(oneMorefinalDFAStates[k] + "_" + totalTransitions[j]);

                            let stateJoined = arrayJoin.join();

                            if (stateJoined == oneMorefinalDFAStates[i]) {
                                isReachable = true;
                                break;
                            }
                        }
                        if (isReachable) {
                            for (j = 0; j < totalTransitions.length; j++) {
                                finalDFA.set(oneMorefinalDFAStates[i] + "_" + totalTransitions[j], dfaTempMap.get(oneMorefinalDFAStates[i] + "_" + totalTransitions[j]));

                            }
                            if (!DFAStates.includes(oneMorefinalDFAStates[i])) {
                                DFAStates.push(oneMorefinalDFAStates[i]);
                            }
                            if (dfaFinalStates.includes(oneMorefinalDFAStates[i])) {
                                if (!newDFAFinalStates.includes(oneMorefinalDFAStates[i])) {
                                    newDFAFinalStates.push(oneMorefinalDFAStates[i]);
                                    //console.log(newDFAFinalStates);
                                }
                            }
                        }
                    }
                }
            }
            else {
                for (j = 0; j < totalTransitions.length; j++) {
                    finalDFA.set(oneMorefinalDFAStates[i] + "_" + totalTransitions[j], dfaTempMap.get(dFAStatesList[i] + "_" + totalTransitions[j]))

                }
                if (!DFAStates.includes(oneMorefinalDFAStates[i])) {
                    DFAStates.push(oneMorefinalDFAStates[i]);
                }
                if (dfaFinalStates.includes(oneMorefinalDFAStates[i])) {
                    if (!newDFAFinalStates.includes(oneMorefinalDFAStates[i])) {
                        newDFAFinalStates.push(oneMorefinalDFAStates[i]);
                        //console.log(newDFAFinalStates);
                    }
                }
            }
        }
        oneMorefinalDFAStates = DFAStates;

        onMoreTempMap = finalDFA;

        dfaFinalStates = newDFAFinalStates;
    }


    return finalDFA;
}
function nextEqMinDFA(equivalanceArray, dfas) { // one by one checking all the states for stability. ( minimize dfa) equivalence array holds the state groups.

    let nextEquivance = [];
    //console.log(equivalanceArray);
    for (let i = 0; i < equivalanceArray.length; i++) {

        if (equivalanceArray[i].length > 1) {

            let headIndex = 0;

            let matched = [];
            let unMatched = [];

            if (!matched.includes(equivalanceArray[i][headIndex])) {

                matched.push(equivalanceArray[i][headIndex]);
            }

            for (let j = 1; j < equivalanceArray[i].length; j++) {

                let isSameCat = minimeDFAEQ(equivalanceArray[i][headIndex], equivalanceArray[i][j], dfas, equivalanceArray);

                if (isSameCat) {
                    if (!matched.includes(equivalanceArray[i][j])) {
                        matched.push(equivalanceArray[i][j]);
                    }
                }
                else {
                    if (!unMatched.includes(equivalanceArray[i][j])) {
                        unMatched.push(equivalanceArray[i][j]);
                    }
                }
                if (equivalanceArray[i].length - 1 == j) {
                    if (matched.length!=0) {
                        nextEquivance.push(matched);
                    }
                    if (unMatched.length != 0) {
                        nextEquivance.push(unMatched);
                    }
                }
            }

        }
        else {
            if (equivalanceArray[i].length == 1) {
                nextEquivance.push(equivalanceArray[i]);
            }
        }
    }
    //console.log(nextEquivance);
    return nextEquivance;
}
function minimeDFAEQ(state1, state2, dfas, listOfAllEQval) { // this function is responsible for checking if two states are stable or not.

    let isSameCat = false;

    for (let i = 0; i < totalTransitions.length; i++) {

        let transState0 = dfas.get(state1 + "_" + totalTransitions[i]);
        let nextJState0 = transState0.join();

        let transState1 = dfas.get(state2 + "_" + totalTransitions[i]);
        let nextJState1 = transState1.join();

        let getThatEqindex;

        for (let j = 0; j < listOfAllEQval.length; j++) {
            if (listOfAllEQval[j].includes(nextJState0)) {
                getThatEqindex = j;
                break;
            }
        }
        if (listOfAllEQval[getThatEqindex].includes(nextJState1)) {
            isSameCat = true;
        }
        else {
            isSameCat = false;
            return isSameCat;
        }
    }

    return isSameCat;
}

function arr_diff(a1, a2) { //used this function for finding non final states from all the states. (minimizing dfa)

    var a = [], diff = [];

    for (var i = 0; i < a1.length; i++) {
        a[a1[i]] = true;
    }

    for (var i = 0; i < a2.length; i++) {
        if (a[a2[i]]) {
            delete a[a2[i]];
        } else {
            a[a2[i]] = true;
        }
    }

    for (var k in a) {
        diff.push(k);
    }

    return diff;
}
function union_arrays(x, y) { // a function for union operation
    var obj = {};

    for (var i = x.length - 1; i >= 0; --i)
        obj[x[i]] = x[i];
    for (var i = y.length - 1; i >= 0; --i)
        obj[y[i]] = y[i];
    var res = []
    for (var k in obj) {
        if (obj.hasOwnProperty(k))  // <-- optional
            res.push(obj[k]);
    }
    return res;
}
class State { // a class for holding nfa data
    constructor(transition, nextState, stateID) {
        this.transition = transition;
        this.nextState = nextState;
        this.stateID = stateID;
    }
}
function drawTestUI() {

    convertRG();

    if (!invalidFormat) {
        let form = document.createElement('form');

        let labelForm = document.createElement('label');
        labelForm.setAttribute('for', 'inputStringForm');
        labelForm.innerHTML = "Check Strings(input)";

        let divFirst = document.createElement('div');
        divFirst.setAttribute('class', 'form-group');
        divFirst.setAttribute('id', 'inputStringForm');
        divFirst.style.width = "auto";
        divFirst.style.minWidth = "30%";

        for (let i = 0; i < 5; i++) {

            let divInsides = document.createElement('div');
            divInsides.setAttribute('class', 'd-flex flex-row');

            let divInsides1Pont1 = document.createElement('div');
            divInsides1Pont1.setAttribute('class', 'p-2');

            let divInsides1Pont2 = document.createElement('div');
            divInsides1Pont2.setAttribute('class', 'p-2');
            divInsides1Pont2.setAttribute('id', 'inputStringsImageDiv' + i);
            divInsides1Pont2.style.display = "none";

            let textArea = document.createElement('textarea');
            textArea.setAttribute('class', 'form-control');
            textArea.setAttribute('id', 'checkStrings' + i);
            textArea.setAttribute('rows', '1');
            textArea.setAttribute('placeholder', 'Enter String');
            textArea.style.resize = "none";
            textArea.style.overflow = "hidden";

            divInsides1Pont1.appendChild(textArea);

            divInsides.appendChild(divInsides1Pont1);
            divInsides.appendChild(divInsides1Pont2);

            divFirst.appendChild(divInsides);
        }

        let divForButton = document.createElement('div');
        divForButton.setAttribute('class', 'd-flex align-items-center justify-content-center');

        let div1ForButton = document.createElement('div');
        div1ForButton.setAttribute('class', 'p-2');

        let testButton = document.createElement('button');
        testButton.setAttribute('class', 'btn btn-primary');
        testButton.setAttribute('type', 'button');
        testButton.setAttribute('onclick', 'testMinimizedDFA()');
        testButton.innerHTML = "Check";

        let generateRandomMachineButton = document.createElement('button');
        generateRandomMachineButton.setAttribute('class', 'btn btn-secondary');
        generateRandomMachineButton.setAttribute('type', 'button');
        generateRandomMachineButton.setAttribute('onclick', 'generateRandomMachine()');
        generateRandomMachineButton.innerHTML = "Randomize Machine";
        generateRandomMachineButton.style.marginLeft = "10px";

        div1ForButton.appendChild(testButton);
        div1ForButton.appendChild(generateRandomMachineButton);

        divForButton.appendChild(div1ForButton);

        divFirst.appendChild(divForButton);

        form.appendChild(labelForm);
        form.appendChild(divFirst)

        mainView.appendChild(form);
    }
    else {
        mainView.innerHTML = "Please enter correct Regular expression!";
    }
}
function generateRandomMachine() {
    for (let j = 0; j < 5; j++) {
        let length = Math.floor(Math.random() * 10) + 1;
        let inputCheckString = document.getElementById("checkStrings" + j);
        let randomTransitionString = "";
        for (let i = 0; i < length; i++) {
            randomTransitionString += totalTransitions[Math.floor(Math.random() * totalTransitions.length)];
        }
        inputCheckString.value = randomTransitionString;
    }
}
//Mubdiul
