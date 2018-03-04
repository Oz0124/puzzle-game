// puzzle component
var OO = OO || {};
OO.Modules = OO.Modules || {};

OO.Modules.PuzzleGameComponent = (function() {

	// 產生亂數
	let getRandomArray = function (minNum, maxNum, n) {
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
	let _init = function (container) {
		// upload image
		let openImageDiv = $('<div class="open-image"></div>');
		let openFileInput = $('<input class="open-file-input">').attr('type', 'file').attr('multiple', false);
		openFileInput.attr('accept', 'image/*');
		let openButton = $('<button class="btn btn-default btn-block open-button"><span class="glyphicon glyphicon-open"></span> 開啟圖檔</button>');

		openImageDiv.append(openFileInput);
		openImageDiv.append(openButton);
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
	let create = function (options, container) {
		_init(container);

		let tileContainer = container.find('.tile-container');
		let tileList = tileContainer.find('.tile-list');
		let openFileInput = container.find('.open-image .open-file-input');
		let imageBlock = container.find('.image-container .image-block');
		let puzzleWidthCount = options.puzzleWidthCount || 4;
		let puzzleHeightCount = options.puzzleHeightCount || 4;
		

		let markPuzzleTile = function (img, widthCount, heightCount, listcontainer) {
			let containerWidth = listcontainer.width();
			let imgWidth = img.width;
			let imageHeight = img.height;
			let scalingRate = 1;
			let tileDiv = null;
			let tileImageCanvas = null;
			let context = null;
			let levelIndex = [];
			let verticalIndex = [];
			
			scalingRate = containerWidth / imgWidth;
			levelIndex = getRandomArray(0, widthCount - 1, widthCount);
			verticalIndex = getRandomArray(0, heightCount - 1, heightCount);
			
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

		if (options.puzzleImageSrc) {
			let img = new Image();
			img.onload = function(){
				if ((img.width >= 400) &&
					(img.height >= 400)) {

					markPuzzleTile(img, puzzleWidthCount, puzzleHeightCount, tileList);


					// 原圖顯示
					imageBlock.off('load');
					imageBlock.on('load', function() {
						console.log(this.naturalWidth + 'x' + this.naturalHeight);
					});
					imageBlock.attr('src', options.puzzleImageSrc);	
				}
				else {
					alert('圖片寬高需大於400x400!');
				}
			};
			img.src = options.puzzleImageSrc;
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

				let img = new Image();
				img.onload = function(){
					if ((img.width >= 400) &&
						(img.height >= 400)) {

						markPuzzleTile(img, puzzleWidthCount, puzzleHeightCount, tileList);


						// 原圖顯示
						imageBlock.off('load');
						imageBlock.on('load', function() {
							console.log(this.naturalWidth + 'x' + this.naturalHeight);
						});
						imageBlock.attr('src', fileData.imgSrc);	
					}
					else {
						alert('圖片寬高需大於400x400!');
					}
				};
				img.src = fileData.imgSrc;

				
				openFileInput.val('');
			}			
		});

		// create sortable
		let element = tileList.get(0);

		let sortable = Sortable.create(element, {
			handle: '.tile',
			dataIdAttr: 'data-id',	
			onSort: function (evt) {
	
			}

		});
		
		return sortable;
	};

	let getSortArray = function (component) {
		let array = [];

		if (component) {
			$.each(component.toArray(), function (index, item) {
				array.push(item);
			});

		}
		
		return array;
	};

	return {
		create: create,
		getSortArray: getSortArray
	};

}());