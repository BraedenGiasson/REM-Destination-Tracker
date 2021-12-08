
let getAllStations = document.querySelector('#all-stations');

function test(){

    let xhr = new XMLHttpRequest();
    xhr.open("GET", "../../all-stations.txt", true);
    xhr.onload = function(){
        let lines = xhr.responseText.split("\n");
        console.log(lines);
        console.log(xhr.responseText + "\n");

        console.log(xhr.response);
        console.log(xhr);

        for (let i = 0; i < lines.length; i++) {
            CreatingOptionsForBranches ( lines[i] )
        }
    }
    xhr.send();
}
test();

function CreatingOptionsForBranches( line ){

    let createOption = document.createElement('option');
    createOption.innerHTML = line;
    getAllStations.appendChild( createOption );
    document.body.appendChild ( getAllStations );
}

function test2(){

    let xhr = new XMLHttpRequest();
    xhr.open("GET", "../../Main Branch stations.txt", true);
    xhr.onload = function(){
        let lines = xhr.responseText.split("\n");
        console.log(lines);
        console.log(xhr.responseText + "\n");

        console.log(xhr.response);
        console.log(xhr);

        for (let i = 0; i < lines.length; i++) {
            CreatingOptionsForBranches ( lines[i] )
        }
    }
    xhr.send();
}
test2();