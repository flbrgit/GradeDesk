class Base{
    constructor() {
        let item = localStorage.getItem("category");
        this.category = item != null ? item : null;
        this.all_categories = ["grades", "points"];
        this.retrieve_information();
        document.onload = this.update;
    }

    change_category(neu){
        if(this.all_categories.indexOf(neu) > -1){
           this.category = neu;
           document.getElementById("section_headline").innerText = neu;
           localStorage.setItem("category", base.category);
           this.update();
        }
    }

    create_new_student(){
        let input = prompt("Bitte Vor- und Nachnamen eingeben");
        if (input != null){
            this.students.push(this.create_student(input));
            this.save_information();
        }
    }

    create_new_section(){
        let input = prompt("Bitte Namen des Lernbereichs eingeben");
        if (input != null){
            this.sections.push(this.create_section(input));
            this.save_information();
        }
    }

    create_student(name){
        let student = {"name": name}
        return student;
    }

    create_section(name){
        let b = false;
        for(let s of this.sections)
            if (s["name"] === name)
                b = s;
        if(b){
            let conf = confirm("Ein Lernbereich mit diesem Namen existiert bereits. Notenspalte zu diesem hinzufügen?");
            if (!conf)
                return;
            b["columns"] += 1;
            return;
        }
        return {"name": name, "columns": 1}
    }

    save_information(){
        localStorage.setItem("students", JSON.stringify(this.students));
        localStorage.setItem("sections", JSON.stringify(this.sections));
    }

    retrieve_information(){
        this.students = JSON.parse(localStorage.getItem("students"));
        if(this.students == null)
            this.students = [];
        this.sections = JSON.parse(localStorage.getItem("sections"));
        if(this.sections == null)
            this.sections = [];
    }

    update(){
        this.save_information();
        switch (this.category){
            case "grades":
                document.getElementById("section_headline").innerHTML = "Notenübersicht";
                this.update_grades();
                break;
            case "points":
                document.getElementById("section_headline").innerHTML = "Punkteübersicht";
                break;
            default:
                document.getElementById("section_headline").innerHTML = "Keine Kategorie ausgewählt";
                break;
        }
        this.retrieve_information();
    }

    update_grades(){
        let table = document.createElement("table");
        this.retrieve_information();
        table.style.fontFamily = 'AntonZora';
        table.style.borderCollapse = "collapse";
        table.style.border = "5px double rgb(0,200,0)";
        table.style.borderRadius = "5px";
        table.style.color = "black";
        table.style.visibility = "visible";
        table.id = "table2";
        let row = table.insertRow();
        let cell = row.insertCell();
        cell.innerHTML = "";
        //  width=60% class="sortable table"
        for(let section of this.sections){
            let cell = row.insertCell();
            cell.innerHTML = section["name"];
        }
        for (let student of this.students) {
            let row = table.insertRow();
            let cell = row.insertCell();
            cell.innerHTML = student["name"];
            for (let section of this.sections) {
                let cell = row.insertCell();
            }
            cell.class = "min";
        }
        document.getElementById("table1").appendChild(table);
        this.save_information();
    }
}