var interval;
var gridSize = 4;
var remainingPieces = {};
var dragged;
var gameStarted = false;
var gameFinished = false;

document.addEventListener("DOMContentLoaded", contentLoaded, false);
document.addEventListener("dragstart", onDragStart, false);
document.addEventListener("dragover", onDragOver, false);
document.addEventListener("drop", onDrop, false);

function contentLoaded() {
	createGrid();
	shufflePieces();
	startGame();
}

function onDragStart(event) {
	dragged = event;
}

function onDragOver(event) {
	event.preventDefault();
}

function onDrop(event) {
	event.preventDefault();
	if (!gameStarted || gameFinished) return;

	if (event.target.className == "dropzone") {
		var element = dragged.target;
		var dropzone = event.target;

		handlePieceEvent(element, dropzone);
	}
}

function onPieceClick(event) {
	if (!gameStarted || gameFinished) return;

	var element = event.target;
	var dropzone = document.querySelector("[data-final-position='16']");

	handlePieceEvent(element, dropzone);
}

function createGrid() {
	var puzzleArray = createPuzzleArray();
	var grid = document.querySelector(".grid");

	for (let i = 0; i < puzzleArray.length; i++) {
		let gridPosition = puzzleArray[i];
		let currentPosition = i + 1;
		let div = document.createElement("div");
		div.className = "piece";
		div.dataset.currentPosition = gridPosition;
		div.dataset.finalPosition = currentPosition;
		div.onclick = onPieceClick;
		div.draggable = true;

		grid.appendChild(div);

		if (gridPosition != currentPosition) {
			remainingPieces[gridPosition] = true;
		}
	}

	var max = Math.pow(gridSize, 2);
	var dropzone = document.createElement("div");
	dropzone.className = "dropzone";
	dropzone.dataset.currentPosition = max;
	dropzone.dataset.finalPosition = max;

	grid.appendChild(dropzone);
}

function shufflePieces() {
	interval = setInterval(function() {
		var puzzleArray = createPuzzleArray();

		for (let i = 0; i < puzzleArray.length; i++) {
			let currentPosition = puzzleArray[i];
			let finalPosition = i + 1;
			let div = document.querySelector("[data-final-position='" + finalPosition + "']");
			div.dataset.currentPosition = currentPosition;

			setRemainingPieces(currentPosition, finalPosition);
		}
	}, 2500);
}

function startGame() {
	var start = document.querySelector(".start");
	var grid = document.querySelector(".grid");

	start.onclick = function() {
		gameStarted = true;
		clearInterval(interval);

		start.classList.add("hide");
		grid.classList.add("started");
	}
}

function handlePieceEvent(element, dropzone) {
	var currentPositionString = element.dataset.currentPosition;
	var finalPositionString = element.dataset.finalPosition;
	var dropzonePositionString = dropzone.dataset.currentPosition;

	var currentPosition = parseInt(currentPositionString);
	var finalPosition = parseInt(finalPositionString);
	var dropzonePosition = parseInt(dropzonePositionString);

	var dropzoneIsTop = currentPosition - gridSize == dropzonePosition;
	var dropzoneIsRight = currentPosition + 1 == dropzonePosition;
	var dropzoneIsBottom = currentPosition + gridSize == dropzonePosition;
	var dropzoneIsLeft = currentPosition - 1 == dropzonePosition;

	if (dropzoneIsTop || dropzoneIsRight || dropzoneIsBottom || dropzoneIsLeft) {
		element.dataset.currentPosition = dropzonePosition;
		dropzone.dataset.currentPosition = currentPosition;
		setRemainingPieces(dropzonePosition, finalPosition);
	}

	var remaining = Object.getOwnPropertyNames(remainingPieces).length;
	if (remaining == 0) {
		gameFinished = true;
		var wrapper = document.querySelector(".wrapper");
		var grid = document.querySelector(".grid");
		grid.classList.remove("started");
		wrapper.classList.add("finished");
	}
}

function createPuzzleArray() {
	var max = Math.pow(gridSize, 2);
	var values = [];
	var puzzleArray;
	var inversionsIsEven = false;

	for (let i = 1; i < max; i++) {
		values.push(i);
	}

	while(inversionsIsEven == false) {
		puzzleArray = [];
		var tempValues = Object.assign([], values);

		for (let i = 0; i < max - 1; i++) {
			let randomIndex = randomizer(0, tempValues.length - 1);
			puzzleArray.push(tempValues[randomIndex]);
			tempValues.splice(randomIndex, 1);
		}

		var inversions = 0;
		for (let i = 0; i < puzzleArray.length; i++) {
			let currentValue = puzzleArray[i];
			for (let j = i; j < puzzleArray.length; j++) {
				if (currentValue > puzzleArray[j]) {
					inversions += 1;
				}
			}
		}

		if (inversions % 2 == 0) {
			inversionsIsEven = true;
		}
	}

	return puzzleArray;
}

function setRemainingPieces(currentPosition, finalPosition) {
	if (currentPosition == finalPosition) {
		delete remainingPieces[finalPosition];
	} else {
		remainingPieces[finalPosition] = true;
	}
}

function randomizer(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1)) + min;
}