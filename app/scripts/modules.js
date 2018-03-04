// puzzle component
var OO = OO || {};
OO.Modules = OO.Modules || {};

OO.Modules.PuzzleGameComponent = function(options, container) {
	this.puzzleImageSrc = options.imageBase64 || ''; 
	this.puzzleWidthCount = options.puzzleWidthCount || 4,
	this.puzzleHeightCount = options.puzzleHeightCount || 4;
	this.imageWidthMin = options.imageWidthMin || 400;
	this.imageHeightMin = options.imageHeightMin || 400;
	this.container = container;
	this.component = null;
	this.levelIndex = [];
	this.verticalIndex = [];
	this.img = null;

	// functions
	let _getRandomArray = OO.Modules.PuzzleGameComponent.prototype._getRandomArray;
	let _init = OO.Modules.PuzzleGameComponent.prototype._init;
	let _markPuzzleTile = OO.Modules.PuzzleGameComponent.prototype._markPuzzleTile;

	// 
	let levelIndex = _getRandomArray(0, this.puzzleWidthCount - 1, this.puzzleWidthCount);
	let verticalIndex = _getRandomArray(0, this.puzzleHeightCount - 1, this.puzzleHeightCount);
	this.levelIndex = levelIndex;
	this.verticalIndex = verticalIndex;
	
	_init(container);

	let tileContainer = container.find('.tile-container');
	let tileList = tileContainer.find('.tile-list');
	let openFileInput = container.find('.open-image .open-file-input');
	let imageBlock = container.find('.image-container .image-block');
	let puzzleWidthCount = this.puzzleWidthCount;
	let puzzleHeightCount = this.puzzleHeightCount;
	let img = null;
	let sortable = null;

	if (options.puzzleImageSrc) {
		img = new Image();
		img.onload = function(){
			if ((img.width >= options.imageWidthMin) &&
				(img.height >= options.imageHeightMin)) {

				_markPuzzleTile(img, puzzleWidthCount, puzzleHeightCount, levelIndex, verticalIndex, tileList);

				// 原圖顯示
				imageBlock.off('load');
				imageBlock.on('load', function() {
					console.log(this.naturalWidth + 'x' + this.naturalHeight);
				});
				imageBlock.attr('src', img.src);	
			}
			else {
				alert('圖片寬高需大於' + options.imageWidthMin + 'x' + options.imageHeightMin + '!');
			}
		};
		img.src = options.puzzleImageSrc;

		this.img = img;
	}

	container.find('.open-button').click(function () {
		openFileInput.click();
	});		

	// open file input event
	openFileInput.bind('change', function () {
		let files = this.files;
		let fileData = null;

		if (files.length > 0) {
			fileData = {
				id: files[0].name,
				imgSrc: window.URL.createObjectURL(files[0])
			};

			img = new Image();
			img.onload = function(){
				if ((img.width >= options.imageWidthMin) &&
					(img.height >= options.imageHeightMin)) {

					_markPuzzleTile(img, puzzleWidthCount, puzzleHeightCount, levelIndex, verticalIndex, tileList);

					// 原圖顯示
					imageBlock.off('load');
					imageBlock.on('load', function() {
						console.log(this.naturalWidth + 'x' + this.naturalHeight);
					});
					imageBlock.attr('src', img.src);	
				}
				else {
					alert('圖片寬高需大於' + options.imageWidthMin + 'x' + options.imageHeightMin + '!');
				}
			};
			img.src = fileData.imgSrc;

			this.img = img;
				
			openFileInput.val('');
		}			
	});

	// create sortable
	let element = tileList.get(0);

	sortable = Sortable.create(element, {
		handle: '.tile',
		dataIdAttr: 'data-id',	
		onSort: function (evt) {
	
		}
	});

	this.component = sortable;

	$(window).resize(function() {
		let sortArray = sortable.toArray();
		_markPuzzleTile(img, puzzleWidthCount, puzzleHeightCount, levelIndex, verticalIndex, tileList);
		sortable.sort(sortArray);
	});
};

// 產生亂數
OO.Modules.PuzzleGameComponent.prototype._getRandomArray  = function (minNum, maxNum, n) {
	let array = [];
	let exist = false;
	let number = 0;
	let index = 0;
 
	for (index = 0; index < n; index++) {
		number = 0;
		exist = true;

		do {
			number = Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum;
			 			
			 // 不存在
			if (array.indexOf(number) === -1) {
				exist = false;
			}
			 
		} while (exist);
			 
		array[index] = number;
	}
	return array;
};

// 初始化element
OO.Modules.PuzzleGameComponent.prototype._init = function (container) {
	// upload image
	let openImageDiv = $('<div class="open-image"></div>');
	let openFileInput = $('<input class="open-file-input">').attr('type', 'file').attr('multiple', false);
	openFileInput.attr('accept', 'image/*');

	openImageDiv.append(openFileInput);
	container.append(openImageDiv);

	let puzzleBlock = $('<div class="puzzle-block"></div>');

	// tile list
	let tileContainer = $('<div class="tile-container"></div>');
	let tileList = $('<div class="tile-list"></div>');

	tileContainer.append(tileList);
	puzzleBlock.append(tileContainer);

	// ori image
	let imageContainer = $('<div class="image-container"></div>');
	let imageBlock = $('<img class="image-block">');
	imageContainer.append(imageBlock);
	puzzleBlock.append(imageContainer);

	container.append(puzzleBlock);
};

//
OO.Modules.PuzzleGameComponent.prototype._markPuzzleTile = function (img, widthCount, heightCount, levelIndex, verticalIndex, listcontainer) {
	let containerWidth = listcontainer.width();
	let imgWidth = img.width;
	let imageHeight = img.height;
	let scalingRate = 1;
	let tileDiv = null;
	let tileImageCanvas = null;
	let context = null;
			
	scalingRate = containerWidth / imgWidth;
			
	listcontainer.empty();

	$.each(verticalIndex, function (vIndex, i) {
		$.each(levelIndex, function (lIndex, j) {
			tileImageCanvas = $('<canvas>').addClass('tile').attr('data-id', (i * widthCount) + j + 1);

			tileImageCanvas.width(Math.round(containerWidth / widthCount) - (20 / widthCount));
			tileImageCanvas.height(Math.round((imageHeight * scalingRate) / heightCount));
			// 必須指定width, height，否則繪圖的座標會不準確
			tileImageCanvas.attr('width', tileImageCanvas.width());
			tileImageCanvas.attr('height', tileImageCanvas.height());

			context = tileImageCanvas[0].getContext('2d');

			context.drawImage(img, 
				j * Math.round((imgWidth / widthCount)), 
				i * Math.round((imageHeight / heightCount)), 
				Math.round(imgWidth / widthCount), 
				Math.round(imageHeight / heightCount), 
				0, 0, tileImageCanvas.width(), tileImageCanvas.height());

			tileImageCanvas.append(tileImageCanvas);
			listcontainer.append(tileImageCanvas);			
		});
	});
};

OO.Modules.PuzzleGameComponent.prototype.getSortArray = function () {
	let component = this.component;
	let array = [];

	if (component) {
		$.each(component.toArray(), function (index, item) {
			array.push(item);
		});

	}
		
	return array;
};

OO.Modules.PuzzleGameComponent.prototype.openImageFile = function () {
	this.container.find('.open-image .open-file-input').click();	
};

