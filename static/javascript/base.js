class Base{
    constructor() {
        let item = localStorage.getItem("category");
        this.category = item != null ? item : null;
        this.all_categories = ["grades", "points"];
        this.percentages = [0.95, 0.8, 0.65, 0.5, 0.35, 0.0];
        this.retrieve_information();
        document.onload = this.update;
    }

    export_data(){
        let data = JSON.stringify([JSON.stringify(this.students), JSON.stringify(this.sections), JSON.stringify(this.exams)]);
        let name = prompt("Bitte Dateinamen eingeben:");
        if (name != null)
            download(data, name + ".gradedesk", "plaintext");
    }

    import_data(data){
        readText(data, this);
    }

    set_students(students){
        this.students = JSON.parse(students);
        this.save_information();
        this.update();
    }

    set_sections(sections){
        this.sections = JSON.parse(sections);
        this.save_information();
        this.update();
    }

    set_exams(exams){
        this.exams = JSON.parse(exams);
        this.save_information();
        this.update();
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
            let s = this.create_section(input);
            if (s != null)
                this.sections.push(s);
            this.save_information();
        }
    }

    create_student(name){
        return {"name": name};
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
        localStorage.setItem("exams", JSON.stringify(this.exams));
    }

    retrieve_information(){
        this.students = JSON.parse(localStorage.getItem("students"));
        if(this.students == null)
            this.students = [];
        this.sections = JSON.parse(localStorage.getItem("sections"));
        if(this.sections == null)
            this.sections = [];
        this.exams = JSON.parse(localStorage.getItem("exams"));
        if(this.exams == null)
            this.exams = [];
    }

    update(){
        this.save_information();
        let sidebar = document.getElementById("grades");
        sidebar.innerHTML = "";
        let main = document.getElementById("form1");
        let form = document.createElement("form");
        try{
            main.removeChild(form);
        }catch (e) {}
        switch (this.category){
            case "grades":
                document.getElementById("section_headline").innerHTML = "Notenübersicht";
                this.update_grades();
                break;
            case "points":
                document.getElementById("section_headline").innerHTML = "Punkteübersicht";
                this.update_exams();
                break;
            default:
                document.getElementById("section_headline").innerHTML = "Keine Kategorie ausgewählt";
                let all = document.getElementById("sidebar");
                all.width = 230;
                break;
        }
        this.retrieve_information();
    }

    update_grades(){
        let sidebar = document.getElementById("grades");
        sidebar.innerHTML = '<br>\n' +
            '                    <div style="align-content: center">\n' +
            '                        <a href="" onclick="base.create_new_student()" class="wrapper">\n' +
            '                            <!--<div class="tooltip">Einen neuen Schüler erstellen</div>-->\n' +
            '                            Schüler erstellen\n' +
            '                        </a>\n' +
            '                        <br>\n' +
            '                        <br>\n' +
            '                        <a href="" onclick="base.create_new_section()" class="wrapper">\n' +
            '                            <!--<div class="tooltip">Einen neuen Lernbereich für Noten erstellen</div>-->\n' +
            '                            Lernbereich erstellen\n' +
            '                        </a>\n' +
            '                    </div>';
        let all = document.getElementById("sidebar");
        all.width = 285;
        let old = document.getElementById("table2");
        if(old != null)
            old.parentNode.removeChild(old);
        let table = document.createElement("table");
        this.retrieve_information();
        table.style.fontFamily = 'AntonZora';
        table.style.borderCollapse = "collapse";
        table.style.border = "5px double rgb(0,200,0)";
        table.style.borderRadius = "5px";
        table.style.color = "black";
        table.style.visibility = "visible";
        table.id = "table2";
        table.style.marginRight = "20px";
        let row = table.insertRow();
        let cell = row.insertCell();
        cell.innerHTML = "";
        cell = row.insertCell();
        cell.innerHTML = "";
        //  Names of sections
        let thead = document.createElement('thead');

        table.appendChild(thead);
        thead.appendChild(document.createElement("th"));
        thead.appendChild(document.createElement("th"));
        for (let section of this.sections) {
            let header = document.createElement("th");
            header.innerHTML = section["name"];
            header.colSpan = parseInt(section["columns"]);
            thead.appendChild(header);
            let space = document.createElement("th");
            space.style.minWidth = "30px";
            space.style.color = "#0000FF";
            thead.appendChild(space);
        }
        row = table.insertRow();
        cell = row.insertCell();
        cell.innerHTML = "";
        cell = row.insertCell();
        cell.innerHTML = "";
        //  Columns of sections
        for(let section of this.sections){
            for (let i = 0; i < section["columns"]; i++){
                let cell = row.insertCell();
                cell.innerHTML = "<img alt='error' src='/static/images/verboten.png' " +
                    "width='30' " +
                    "onclick='base.delete_section(\"" + section["name"] + "\")'/>";
            }
            let cell = row.insertCell();
            cell.innerHTML = "";
        }

        for (let student of this.students) {
            let row = table.insertRow();
            let cell = row.insertCell();
            cell.innerHTML = "<img alt='error' src='/static/images/verboten.png' " +
                "width='30' " +
                "onclick='base.delete_student(\"" + student["name"] + "\")'/>";
            cell = row.insertCell();
            cell.innerHTML = student["name"];
            cell.className = "min";
            for (let section of this.sections) {
                for (let i = 0; i < section["columns"]; i++){
                    let cell = row.insertCell();
                    cell.innerHTML = "";
                }
                cell = row.insertCell();
                cell.innerHTML = "";
                cell.setAttribute("name", "section_grade");
                cell.style.background = "#96f5aa";
            }
        }
        document.getElementById("table1").appendChild(table);
        this.save_information();
    }

    delete_student(name){
        let students = [];
        for(let student in this.students){
            student = this.students[student];
            if (student["name"] !== name)
                students.push(student);
        }
        this.students = students;
        this.save_information();
        this.update_grades();
    }

    delete_section(name){
        let check = confirm("Lernbereich '" + name + "' wirklich löschen?");
        if(!check)
            return;
        let sections = [];
        for(let section in this.sections){
            section = this.sections[section];
            if (section["name"] === name){
                if(section["columns"] > 1){
                    section["columns"] -= 1;
                    sections.push(section);
                }
            }else{
                sections.push(section);
            }
        }
        this.sections = sections;
        this.save_information();
        this.update_grades();
    }

    create_exam(){
        let main = document.getElementById("form1");
        let old = document.getElementById("exam_headline");
        if(old != null){
            main.removeChild(document.getElementById("form2"));
        }
        let form = document.createElement("div");
        form.id = "form2";
        let headline = document.createElement("label");
        headline.className = "h2";
        headline.htmlFor = "form2";
        headline.innerText = "Prüfung erstellen";
        headline.id = "exam_headline";
        form.appendChild(headline);
        form.appendChild(document.createElement("br"));
        let name_lable = document.createElement("label");
        name_lable.htmlFor = "exam_name";
        name_lable.innerText = "Name der Prüfung:";
        name_lable.id = "exam_label";
        let exam_name = document.createElement("input");
        exam_name.type = "text";
        exam_name.id = "exam_name";
        exam_name.onkeyup = base.check_valid_exam_input;
        form.appendChild(name_lable);
        form.appendChild(exam_name);
        form.appendChild(document.createElement("br"));
        let name_section = document.createElement("label");
        name_section.htmlFor = "exam_name";
        name_section.innerText = "Lernbereich:";
        name_section.id = "exam_section_label";
        let exam_section = document.createElement("input");
        exam_section.type = "text";
        exam_section.id = "exam_section";
        exam_section.onkeyup = base.check_valid_exam_input;
        form.appendChild(name_section);
        form.appendChild(exam_section);
        form.appendChild(document.createElement("br"));
        let points_lable = document.createElement("label");
        points_lable.htmlFor = "points";
        points_lable.innerText = "Gesamtpunktzahl:";
        points_lable.id = "points_label";
        let exam_points = document.createElement("input");
        exam_points.type = "number";
        exam_points.id = "points";
        exam_points.onkeyup = base.create_scores;
        form.appendChild(points_lable);
        form.appendChild(exam_points);
        main.appendChild(form);
    }

    create_scores(){
        let main = document.getElementById("form3");
        let old = document.getElementById("table4");
        let old2 = document.getElementById("label");
        let old3 = document.getElementById("exec_button");
        if(old != null) {
            main.removeChild(old);
        }if(old2 != null){
            main.removeChild(old2);
        }if(old3 != null){
            main.removeChild(old3);
        }
        let points = document.getElementById("points").value;
        let label = document.createElement("label");
        label.innerText = "Notenschlüssel:";
        label.id = "label";
        main.appendChild(label);
        let table = document.createElement("table");
        base.retrieve_information();
        table.style.fontFamily = 'AntonZora';
        table.style.borderCollapse = "collapse";
        table.style.marginLeft = "175px";
        table.style.border = "5px double rgb(0,200,0)";
        table.style.borderRadius = "5px";
        table.style.color = "black";
        table.style.visibility = "visible";
        table.style.minWidth = "250px";
        table.style.textOverflow = "ellipsis";
        table.id = "table4";
        let row = table.insertRow();
        for(let i = 0; i < 6; i++){
            let cell = row.insertCell();
            cell.innerText = i + 1;
        }
        row = table.insertRow();
        for(let i = 0; i < 6; i++){
            let cell = row.insertCell();
            cell.style.textAlign = "right";
            cell.innerText = parseInt(points * base.percentages[i]);
        }
        main.appendChild(table);
        base.check_valid_exam_input();
    }

    check_valid_exam_input(){
        // Check name
        let name = document.getElementById("exam_name").value;
        // Check Section
        let section = document.getElementById("exam_section").value;
        // Check points
        let points = document.getElementById("points").value;
        let main = document.getElementById("form3");
        let button = document.createElement("button");
        let old3 = document.getElementById("exec_button");
        if(old3 != null){
            main.removeChild(old3);
        }
        button.id = "exec_button";
        button.textContent = "Erstellen";
        button.style.height = "45px";
        button.style.alignSelf = "center";
        if(name.length !== 0 && section.length !== 0 && points >= 7){
            button.className = "bonbon gruen";
            button.onclick = base.add_exam;
        }else{
            button.className = "bonbon rot";
        }
        main.appendChild(button);
    }

    add_exam(){
        // Check name
        let name = document.getElementById("exam_name").value;
        // Check Section
        let section = document.getElementById("exam_section").value;
        // Check points
        let points = document.getElementById("points").value;
        let found = false;
        for(let sec of base.sections){
            if(sec["name"] === section)
                found = true;
        }
        if(!found){
            let yes = confirm("Der angegebene Lernbereich existiert nicht. Erstellen?");
            if(!yes)
                return;
            let neu = base.create_section(section);
            base.sections.push(neu);
        }
        let exam = {"name": name, "points": parseInt(points), "section": section}
        base.exams.push(exam);
        base.save_information();
        base.update();
    }

    update_exams(){
        let sidebar = document.getElementById("grades");
        sidebar.innerHTML = '<br>\n' +
            '                    <div style="align-content: center">\n' +
            '                        <a style="color: #007bff; cursor: pointer" onclick="base.create_exam()" class="wrapper">\n' +
            '                            <!--<div class="tooltip">Einen neuen Schüler erstellen</div>-->\n' +
            '                            Prüfung erstellen\n' +
            '                        </a>\n' +
            '                    </div>';
        let all = document.getElementById("sidebar");
        all.width = 285;
        let old = document.getElementById("table2");
        if(old != null)
            old.parentNode.removeChild(old);
        let table = document.createElement("table");
        this.retrieve_information();
        table.style.fontFamily = 'AntonZora';
        table.style.borderCollapse = "collapse";
        table.style.border = "5px double rgb(0,200,0)";
        table.style.borderRadius = "5px";
        table.style.color = "black";
        table.style.visibility = "visible";
        table.id = "table2";
        table.style.marginRight = "20px";
        document.getElementById("table1").appendChild(table);
    }

    accordion_table(){
        let acc = document.getElementsByClassName("accordion");
        for (let i = 0; i < acc.length; i++) {
            acc[i].addEventListener("click", function() {
                this.classList.toggle("active");
                let panel = this.nextElementSibling;
                if (panel.style.maxHeight) {
                    panel.style.maxHeight = null;
                } else {
                    panel.style.maxHeight = panel.scrollHeight + "px";
                }
            });
        }
    }
}