const listenerSettings = {
    capture: true,
    once: false,
    passive: true,
}
const cube = document.querySelector(".cube");
const body = document.querySelector("body");

document.addEventListener("wheel",(event)=>{
    let currentPerspective = stylesheet.getPropertyValue("--perspective");
    let newPerspective;
    if(event.deltaY < 0){//in
        newPerspective = parseInt(currentPerspective.split("cm")[0]) - 10;
        document.documentElement.style.setProperty("--perspective", newPerspective.toString() +"cm");
    } else {
        newPerspective = parseInt(currentPerspective.split("cm")[0]) + 10;
        document.documentElement.style.setProperty("--perspective", newPerspective.toString() +"cm");
    }
});


const mousemoveHandler = function(event){
    if(typeof event.offsetX !== "number" ||typeof event.offsetY !== "number"|| typeof event.movementX !== "number" || typeof event.movementY !== "number"){
        throw new Error("invalid mouse offset movement detected");
    }


    let currentRotation = cube.style.transform.split(" ");
    // console.log(currentRotation.split(" "));
    // console.log(currentRotation);
    for(let i = 0; i<3;i++){
        // console.log(parseFloat(currentRotation[i].match(/\-?\d+/g)))
        currentRotation[i] = parseFloat(currentRotation[i].match(/\-?\d+/g));
        if(typeof currentRotation[i] !== "number"){
            throw new Error("invalid rotation value read")
        }
    }
    console.log(currentRotation);

    let newRotation = [];
        newRotation[0] = currentRotation[0] - event.movementY/10;
        newRotation[1] = currentRotation[1] + event.movementX/10;
        newRotation[2] = currentRotation[2];

    //     newRotation = newRotation.join()
        newRotation = "rotateX("+ newRotation[0] + "deg) rotateY("+newRotation[1]+"deg) rotateZ("+newRotation[2]+"deg)";

        cube.style.transform = newRotation;

}


const mouseDownHandler = function(event){
    body.style.cursor = "grabbing"
    document.addEventListener("mousemove",mousemoveHandler,listenerSettings);
    document.removeEventListener("mousedown", mouseDownHandler, {passive: true, once: true, capture: true});
    document.addEventListener("mouseup", mouseUpHandler, {passive: true, capture: true, once: true})

}

const mouseUpHandler = function(event){
    body.style.cursor = "grab";
    document.removeEventListener("mousemove",mousemoveHandler,listenerSettings);
    document.removeEventListener("mouseup", mouseUpHandler, {passive: true, capture: true, once: true})
    document.addEventListener("mousedown", mouseDownHandler,{passive: true, once: true, capture: true});
}



document.addEventListener("mousedown", mouseDownHandler, {passive: true, once: true, capture: true});


