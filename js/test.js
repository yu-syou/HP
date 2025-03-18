var image = new Image()

image.onload = function() {
  canvas = document.getElementById("gamecanvas");
  context = canvas.getContext("2d");
  
  context.fillStyle = "rgba(0, 0, 0, 0.5)";
  context.fillRect(0, 0, 300, 300);
 
  context.fillStyle = "rgb(255, 255, 255)";
  context.globalCompositeOperation = "destination-out";
  context.arc(150, 150, 150, 0, Math.PI * 2);
  context.fill();
  
  context.globalCompositeOperation = "destination-over";
  context.drawImage(image, 0, 0, 300, 300)
}

image.src = "./itemImage/stoneSword.png"
let a = 3;
a -= 2 + 1;
console.log(a);