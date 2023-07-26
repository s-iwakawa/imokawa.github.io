///////////////
///定数の定義
const ringSrcArray = [
	"./img/color_1.png",
	"./img/color_2.png",
	"./img/color_3.png",
	"./img/color_4.png",
	"./img/color_5.png",
	"./img/color_6.png",
	"./img/color_7.png",
	"./img/color_8.png",
	"./img/color_9.png",
	"./img/color_10.png"
];
const partsSrcArray = [
	"./img/etc_cat.png",
	"./img/etc_bird.png",
	"./img/etc_giraffe.png",
	"./img/etc_rocket_color.png",
	"./img/etc_rocket_black.png",
	"./img/etc_none.png"
];
const ring = document.getElementsByClassName('ring');
const parts = document.getElementsByClassName('parts');
const scaleBar = document.getElementById('scale-bar');

///////////////
///関数
///canvasを初期化する関数
const initializeCanvas = (targetCanvasElement, targetCanvas) => {
	targetCanvas.clearRect(0, 0, targetCanvasElement.width, targetCanvasElement.height);   ///一度canvasをクリア　（背景→写真→マスクを順番に載せていく必要があるから）
	targetCanvas.fillStyle = 'rgb(0, 0, 0, 1)';
	targetCanvas.fillRect(0, 0, targetCanvasElement.width, targetCanvasElement.height);   ///背景の作成
};

///クロップする円形の枠を表示させる関数
const showCropFrame = (targetCanvasElement, targetCanvas) => {
  const  cropParams = {
    centerX: targetCanvasElement.width / 2,
    centerY: targetCanvasElement.height / 2,
    radius: targetCanvasElement.width / 2
  };
  targetCanvas.beginPath();
  targetCanvas.rect(0, 0, targetCanvasElement.width, targetCanvasElement.height);
  targetCanvas.arc(cropParams.centerX, cropParams.centerY, cropParams.radius, 0, 2 * Math.PI);
  targetCanvas.closePath();
  targetCanvas.fillStyle = 'rgb(91, 91, 91, 0.9)';
  targetCanvas.fill('evenodd');
};

//canvasにリング/パーツを描画する
const addImageToCanvas = (parentCanvas, imgSrc) => {
	const iconImage = new Image();
	iconImage.src = imgSrc;
	parentCanvas.drawImage(iconImage, 0, 0, iconImage.width, iconImage.height, 0, 0, iconImage.width, iconImage.height);
}

const calculateDrawScale = (aspectRatio, img, targetCanvasElement) => {
	if (aspectRatio > 1) {
		return (img.width > targetCanvasElement.width) ? targetCanvasElement.width / img.width
		: (img.height > targetCanvasElement.height) ? targetCanvasElement.height / img.height
		: 1
	} else {
		return (img.height > targetCanvasElement.height) ? targetCanvasElement.height / img.height
		: (img.width > targetCanvasElement.width) ? targetCanvasElement.width / img.width
		: 1;
	}
};

///////////////
///canvasの初期値設定
const warningCanvasElement = document.getElementById('canvas');
const warningCanvas = warningCanvasElement.getContext('2d');
warningCanvas.fillStyle = 'rgb(0, 0, 0, 1)';
warningCanvas.fillRect(0, 0, warningCanvasElement.width, warningCanvasElement.height);
warningCanvas.fillStyle = 'rgb(255, 255, 255)';
warningCanvas.font = '20px "yomogi"';
warningCanvas.textAlign = 'center';
warningCanvas.fillText('アイコンのプレビューが表示されます', warningCanvasElement.width / 2, warningCanvasElement.height / 2);


///////////////
///画像ファイルがアップロードされたときの動作
const downloadButton = document.getElementById('download');
const uploader = document.getElementById('uploader');

uploader.onchange = () => {
	///////////////
	///加工用のcanvasを生成してwarningCanvasと入れ替える
	const canvasElement = document.createElement('canvas');
	canvasElement.width = warningCanvasElement.width;
	canvasElement.height = warningCanvasElement.height;
	const canvas = canvasElement.getContext('2d');
	document.getElementsByClassName('preview-wrapper')[0].removeChild(document.getElementsByTagName('canvas')[0]);
	document.getElementsByClassName('preview-wrapper')[0].prepend(canvasElement);

	initializeCanvas(canvasElement, canvas);

	///////////////
	///アップロードされたファイルを読み込む
	const uploadedFile = uploader.files;
	const fileReader = new FileReader();
	fileReader.onload = () => {
		///////////////
		///画像が読み込まれたら
		const img = new Image();
		img.src = fileReader.result;
		img.onload = () => {
			///////////////
			///ラジオボタンとDLボタンの有効化
			const radioButton = document.getElementsByClassName('radio-button');
			for(let count = 0; count < radioButton.length; count++) radioButton[count].disabled = false;   //for分でラジオボタンのdisabledをfalseにする
			scaleBar.disabled = false;
			downloadButton.style.visibility = 'visible';

			///////////////
			///読み込んだ画像をcanvasで描画する
			const aspectRatio = img.width / img.height;  ///１より大きければアップロードした画像は横長
			let mouseWheelRatio = 1;
			let coordinateX = 0;
			let coordinateY = 0;
			let displacementX = 0;
			let displacementY = 0;
			const drawScale = calculateDrawScale(aspectRatio, img, canvasElement);
			canvas.drawImage(img, 0, 0, img.width, img.height, (canvasElement.width - img.width * drawScale) / 2, (canvasElement.height - img.height * drawScale) / 2, img.width * drawScale, img.height * drawScale);   ///drawScaleをかけた画像をcanvasに描画
			showCropFrame(canvasElement, canvas);

			scaleBar.onchange = (event) => {
				const scale = event.target.value / 10;
				mouseWheelRatio = scale;
				initializeCanvas(canvasElement, canvas);
				canvas.drawImage(img, 0, 0, img.width, img.height, (canvasElement.width - img.width * drawScale * mouseWheelRatio) / 2 + displacementX, (canvasElement.height - img.height * drawScale * mouseWheelRatio) / 2 + displacementY, img.width * drawScale * mouseWheelRatio, img.height * drawScale * mouseWheelRatio);   ///drawScaleをかけた画像をcanvasに描画
				showCropFrame(canvasElement, canvas);
				Object.keys(ring).forEach((key) => {
					if (ring[key].checked) addImageToCanvas(canvas, ringSrcArray[key]);
				});
				Object.keys(parts).forEach((key) => {
					if (parts[key].checked) addImageToCanvas(canvas, partsSrcArray[key]);
				});
			}

			for (let count = 0; count < ring.length; count++) {
				ring[count].onclick = () => {
					initializeCanvas(canvasElement, canvas);
					canvas.drawImage(img, 0, 0, img.width, img.height, (canvasElement.width - img.width * drawScale * mouseWheelRatio) / 2 + displacementX, (canvasElement.height - img.height * drawScale * mouseWheelRatio) / 2 + displacementY, img.width * drawScale * mouseWheelRatio, img.height * drawScale * mouseWheelRatio);   ///drawScaleをかけた画像をcanvasに描画
					showCropFrame(canvasElement, canvas);
					addImageToCanvas(canvas, ringSrcArray[count]);
					Object.keys(parts).forEach((key) => {
						if (parts[key].checked) {
							addImageToCanvas(canvas, partsSrcArray[key]);
						}
					});

					let mouseDown = false;
					canvasElement.onmousedown =
					canvasElement.ontouchstart = (event) => {
						mouseDown = true;
						const rect = event.target.getBoundingClientRect();
						const offsetX = (event.changedTouches) ? event.changedTouches[0].clientX - rect.left : event.offsetX;
						const offsetY = (event.changedTouches) ? event.changedTouches[0].clientY - rect.top : event.offsetY;
						coordinateX = offsetX - displacementX;
						coordinateY = offsetY - displacementY;
						return false;
					}
					canvasElement.onmousemove =
					canvasElement.ontouchmove = (event) => {
						if (!mouseDown) return;
						const rect = event.target.getBoundingClientRect();
						const offsetX = (event.changedTouches) ? event.changedTouches[0].clientX - rect.left : event.offsetX;
						const offsetY = (event.changedTouches) ? event.changedTouches[0].clientY - rect.top : event.offsetY;
						displacementX = offsetX - coordinateX;
						displacementY = offsetY - coordinateY;
						initializeCanvas(canvasElement, canvas);
						canvas.drawImage(img, 0, 0, img.width, img.height, (canvasElement.width - img.width * drawScale * mouseWheelRatio) / 2 + displacementX, (canvasElement.height - img.height * drawScale * mouseWheelRatio) / 2 + displacementY, img.width * drawScale * mouseWheelRatio, img.height * drawScale * mouseWheelRatio);   ///drawScaleをかけた画像をcanvasに描画
						showCropFrame(canvasElement, canvas);
						if (ring[count].checked) addImageToCanvas(canvas, ringSrcArray[count]);
						Object.keys(parts).forEach((key) => {
							if (parts[key].checked) {
								addImageToCanvas(canvas, partsSrcArray[key]);
							}
						});
						return false;
					}
					canvasElement.onmouseup =
					canvasElement.onmouseout =
					canvasElement.ontouchend = (event) => {
						if (!mouseDown) return;
						initializeCanvas(canvasElement, canvas);
						mouseDown = false;
						const rect = event.target.getBoundingClientRect();
						const offsetX = (event.changedTouches) ? event.changedTouches[0].clientX - rect.left : event.offsetX;
						const offsetY = (event.changedTouches) ? event.changedTouches[0].clientY - rect.top : event.offsetY;
						const displacementObj = {
							valueX: offsetX - coordinateX,
							valueY: offsetY - coordinateY
						};
						canvas.drawImage(img, 0, 0, img.width, img.height, (canvasElement.width - img.width * drawScale * mouseWheelRatio) / 2 + displacementX, (canvasElement.height - img.height * drawScale * mouseWheelRatio) / 2 + displacementY, img.width * drawScale * mouseWheelRatio, img.height * drawScale * mouseWheelRatio);   ///drawScaleをかけた画像をcanvasに描画
						showCropFrame(canvasElement, canvas);
						if (ring[count].checked) addImageToCanvas(canvas, ringSrcArray[count]);
						Object.keys(parts).forEach((key) => {
							if (parts[key].checked) {
								addImageToCanvas(canvas, partsSrcArray[key]);
							}
						});
						displacementX = displacementObj.valueX;
						displacementY = displacementObj.valueY;
						return false;
					}
					canvasElement.onmousewheel = (event) => {
						let ratio = event.wheelDelta / 6;
						if (ratio > 100) ratio = 100;
						if (ratio < -100) ratio = -100;
						mouseWheelRatio = Math.round(mouseWheelRatio * 100 + Math.floor(ratio)) / 100;
						if(mouseWheelRatio > 3) mouseWheelRatio = 3;
						if(mouseWheelRatio < 0.1) mouseWheelRatio = 0.1;
						initializeCanvas(canvasElement, canvas);
						canvas.drawImage(img, 0, 0, img.width, img.height, (canvasElement.width - img.width * drawScale * mouseWheelRatio) / 2 + displacementX, (canvasElement.height - img.height * drawScale * mouseWheelRatio) / 2 + displacementY, img.width * drawScale * mouseWheelRatio, img.height * drawScale * mouseWheelRatio);   ///drawScaleをかけた画像をcanvasに描画
						showCropFrame(canvasElement, canvas);
						if (ring[count].checked) addImageToCanvas(canvas, ringSrcArray[count]);
						Object.keys(parts).forEach((key) => {
							if (parts[key].checked) {
								addImageToCanvas(canvas, partsSrcArray[key]);
							}
						});
						return false;
					}
				};
			}
			for (let count = 0; count < parts.length; count++) {
				parts[count].onclick = () => {
					initializeCanvas(canvasElement, canvas);
					canvas.drawImage(img, 0, 0, img.width, img.height, (canvasElement.width - img.width * drawScale * mouseWheelRatio) / 2 + displacementX, (canvasElement.height - img.height * drawScale * mouseWheelRatio) / 2 + displacementY, img.width * drawScale * mouseWheelRatio, img.height * drawScale * mouseWheelRatio);   ///drawScaleをかけた画像をcanvasに描画
					showCropFrame(canvasElement, canvas);
					Object.keys(ring).forEach((key) => {
						if (ring[key].checked) {
							addImageToCanvas(canvas, ringSrcArray[key]);
						}
					});
					addImageToCanvas(canvas, partsSrcArray[count]);

					let mouseDown = false;
					canvasElement.onmousedown =
					canvasElement.ontouchstart = (event) => {
						mouseDown = true;
						const rect = event.target.getBoundingClientRect();
						const offsetX = (event.changedTouches) ? event.changedTouches[0].clientX - rect.left : event.offsetX;
						const offsetY = (event.changedTouches) ? event.changedTouches[0].clientY - rect.top : event.offsetY;
						coordinateX = offsetX - displacementX;
						coordinateY = offsetY - displacementY;
						if (event.changedTouches > 1) touchStartArea = Math.abs(event.changedTouches[1].clientX - rect.left - offsetX) * Math.abs(event.changedTouches[1].clientY - rect.top -offsetY);
						return false;
					}
					canvasElement.onmousemove =
					canvasElement.ontouchmove = (event) => {
						if (!mouseDown) return;
						const rect = event.target.getBoundingClientRect();
						const offsetX = (event.changedTouches) ? event.changedTouches[0].clientX - rect.left : event.offsetX;
						const offsetY = (event.changedTouches) ? event.changedTouches[0].clientY - rect.top : event.offsetY;
						displacementX = offsetX - coordinateX;
						displacementY = offsetY - coordinateY;
						initializeCanvas(canvasElement, canvas);
						canvas.drawImage(img, 0, 0, img.width, img.height, (canvasElement.width - img.width * drawScale * mouseWheelRatio) / 2 + displacementX, (canvasElement.height - img.height * drawScale * mouseWheelRatio) / 2 + displacementY, img.width * drawScale * mouseWheelRatio, img.height * drawScale * mouseWheelRatio);   ///drawScaleをかけた画像をcanvasに描画
						showCropFrame(canvasElement, canvas);
						Object.keys(ring).forEach((key) => {
							if (ring[key].checked) {
								addImageToCanvas(canvas, ringSrcArray[key]);
							}
						});
						if (parts[count].checked) addImageToCanvas(canvas, partsSrcArray[count]);
						return false;
					}
					canvasElement.onmouseup =
					canvasElement.onmouseout =
					canvasElement.ontouchend = (event) => {
						if (!mouseDown) return;
						initializeCanvas(canvasElement, canvas);
						mouseDown = false;
						const rect = event.target.getBoundingClientRect();
						const offsetX = (event.changedTouches) ? event.changedTouches[0].clientX - rect.left : event.offsetX;
						const offsetY = (event.changedTouches) ? event.changedTouches[0].clientY - rect.top : event.offsetY;
						const displacementObj = {
							valueX: offsetX - coordinateX,
							valueY: offsetY - coordinateY
						};
						canvas.drawImage(img, 0, 0, img.width, img.height, (canvasElement.width - img.width * drawScale * mouseWheelRatio) / 2 + displacementX, (canvasElement.height - img.height * drawScale * mouseWheelRatio) / 2 + displacementY, img.width * drawScale * mouseWheelRatio, img.height * drawScale * mouseWheelRatio);   ///drawScaleをかけた画像をcanvasに描画
						showCropFrame(canvasElement, canvas);
						Object.keys(ring).forEach((key) => {
							if (ring[key].checked) {
								addImageToCanvas(canvas, ringSrcArray[key]);
							}
						});
						if (parts[count].checked) addImageToCanvas(canvas, partsSrcArray[count]);
						displacementX = displacementObj.valueX;
						displacementY = displacementObj.valueY;
						return false;
					}
					canvasElement.onmousewheel = (event) => {
						let ratio = event.wheelDelta / 6;
						if (ratio > 100) ratio = 100;
						if (ratio < -100) ratio = -100;
						mouseWheelRatio = Math.round(mouseWheelRatio * 100 + Math.floor(ratio)) / 100;
						if(mouseWheelRatio > 3) mouseWheelRatio = 3;
						if(mouseWheelRatio < 0.1) mouseWheelRatio = 0.1;
						initializeCanvas(canvasElement, canvas);
						canvas.drawImage(img, 0, 0, img.width, img.height, (canvasElement.width - img.width * drawScale * mouseWheelRatio) / 2 + displacementX, (canvasElement.height - img.height * drawScale * mouseWheelRatio) / 2 + displacementY, img.width * drawScale * mouseWheelRatio, img.height * drawScale * mouseWheelRatio);   ///drawScaleをかけた画像をcanvasに描画	
						showCropFrame(canvasElement, canvas);
						Object.keys(ring).forEach((key) => {
								if (ring[key].checked) {
								addImageToCanvas(canvas, ringSrcArray[key]);
							}
						});
						if (parts[count].checked) addImageToCanvas(canvas, partsSrcArray[count]);
						return false;
					}
				};
			}

			///////////////
			///downloadボタンが押されたら
			downloadButton.onclick = () => {
				const cropImageElement = document.createElement('canvas');
    		const cropImageCanvas = cropImageElement.getContext('2d');
    		cropImageElement.width = canvasElement.width;
    		cropImageElement.height = canvasElement.height;
				cropImageCanvas.drawImage(img, 0, 0, img.width, img.height, (canvasElement.width - img.width * drawScale * mouseWheelRatio) / 2 + displacementX, (canvasElement.height - img.height * drawScale * mouseWheelRatio) / 2 + displacementY, img.width * drawScale * mouseWheelRatio, img.height * drawScale * mouseWheelRatio);   ///drawScaleをかけた画像をcanvasに描画
    		cropImageCanvas.globalCompositeOperation = 'destination-in';
    		cropImageCanvas.beginPath();
    		cropImageCanvas.arc(cropImageElement.width / 2, cropImageElement.height / 2, cropImageElement.width / 2, 0, 2 * Math.PI);
    		cropImageCanvas.fillStyle = 'rgb(10, 10, 10, 1)';
    		cropImageCanvas.fill();
    		cropImageCanvas.closePath();
				cropImageCanvas.beginPath();
    		cropImageCanvas.globalCompositeOperation = 'source-over';
				for (let count = 0; count < ring.length; count++) {
					if (ring[count].checked) {
						addImageToCanvas(cropImageCanvas, ringSrcArray[count]);
					}
				}
				for (let count = 0; count < parts.length; count++) {
					if (parts[count].checked) {
						addImageToCanvas(cropImageCanvas, partsSrcArray[count]);
					}
				}
    		const link = document.createElement('a');
    		link.href = cropImageElement.toDataURL('image/png');
    		link.download = 'imoniCamp_icon.png';
    		link.click();
			};
		};
	};
	fileReader.readAsDataURL(uploadedFile[0]);
};