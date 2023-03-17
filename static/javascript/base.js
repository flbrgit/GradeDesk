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
        return {"name": name, "grades": {}};
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
        main = document.getElementById("exam_table");
        removeChildren(main);
        switch (this.category){
            case "grades":
                document.getElementById("section_headline").innerHTML = "Notenübersicht";
                this.update_grades();
                break;
            case "points":
                document.getElementById("section_headline").innerHTML = "Prüfungsübersicht";
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
        thead.appendChild(document.createElement("th"));
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
        cell = row.insertCell();
        cell.innerHTML = "";

        for (let student of this.students) {
            let row = table.insertRow();
            let cell = row.insertCell();
            let cell_list = [];
            cell.innerHTML = "<img alt='error' src='/static/images/verboten.png' " +
                "width='30' " +
                "onclick='base.delete_student(\"" + student["name"] + "\")'/>";
            cell = row.insertCell();
            cell.innerText = student["name"];
            cell.className = "min";
            for (let section of this.sections) {
                let yet_grade = student["grades"][section["name"]];
                let section_list = [];
                let infos = yet_grade !== undefined ? Object.keys(yet_grade) : null;
                for (let i = 0; i < section["columns"]; i++){
                    let cell = row.insertCell();
                    cell.innerText = infos !== null && i < infos.length ? parseInt(yet_grade[infos[i]][1]) : "";
                    section_list.push(infos !== null && i < infos.length ? parseInt(yet_grade[infos[i]][1]) : "");
                }
                cell = row.insertCell();
                cell.innerText = this.calculate_average(section_list);
                cell.setAttribute("name", "section_grade");
                cell.style.background = "#96f5aa";
                cell_list.push(this.calculate_average(section_list));
            }
            cell = row.insertCell();
            cell.style.minWidth = "20px";
            cell.innerText = this.calculate_average(cell_list);
            cell.style.background = "#d5c623";
        }
        document.getElementById("table1").appendChild(table);
        this.save_information();
    }

    calculate_average(cell_list){
        let number = 0;
        let count = 0;
        if(cell_list.length === 0)
            return "";
        for(let cell of cell_list){
            if(cell === "")
                continue;
            let r = parseFloat(cell);
            if(r !== 0) {
                number += r;
                count++;
            }
        }
        if(count === 0)
            return "";
        return Number((number / count).toFixed(2));
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
        let values = {};
        for(let i = 0; i < 6; i++){
            let cell = row.insertCell();
            cell.style.textAlign = "right";
            cell.innerText = Math.round(parseFloat(points * base.percentages[i]));
            values[i] = Math.round(parseFloat(points * base.percentages[i]));
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
        let names = [];
        for(let exam of base.exams){
            names.push(exam["name"]);
        }
        button.id = "exec_button";
        button.textContent = "Erstellen";
        button.style.height = "45px";
        button.style.alignSelf = "center";
        if(name.length !== 0 && section.length !== 0 && points >= 7 && names.indexOf(name) === -1){
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
        let values = {};
        for(let i = 0; i < 6; i++){
            values[i] = Math.round(parseFloat(points * base.percentages[i]));
        }
        let exam = {"name": name, "points": parseInt(points),
            "section": section, "keys": values}
        base.exams.push(exam);
        base.save_information();
        base.update();
        location.reload();
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
        let main = document.getElementById("exam_panel");
        removeChildren(main);
        let all = document.getElementById("sidebar");
        all.width = 285;
        let old = document.getElementById("table2");
        if(old != null)
            old.parentNode.removeChild(old);
        this.retrieve_information();
        for(let exam of base.exams) {
            /**
             <div class="accordion" style="text-align: center">
             <p style="font-size: 20px; font-style: oblique">Kontrolle 01</p>
             <table style="width: 100%; align-content: center;
             text-align: center; background: transparent">
             <tr>
             <td>Lernbereich: Lernbereich 5</td>
             <td>Punkte: 50</td>
             </tr>
             </table>
             </div>
            */
            let exam_element = document.createElement("div");
            exam_element.className = "accordion";
            exam_element.style.textAlign = "center";
            let headline = document.createElement("p");
            headline.style.fontSize = "20px";
            headline.style.fontStyle = "oblique";
            headline.innerText = exam["name"];
            exam_element.appendChild(headline);
            let inner_table = document.createElement("table");
            inner_table.style.width = "100%";
            inner_table.style.alignContent = "center";
            inner_table.style.textAlign = "center";
            inner_table.style.background = "transparent";
            let row = inner_table.insertRow();
            let cell1 = row.insertCell();
            cell1.innerText = "Lernbereich: " + exam["section"];
            let cell2 = row.insertCell();
            cell2.innerText = "Punkte: " + exam["points"];
            let cell3 = row.insertCell();
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
            table.style.alignSelf = "center";
            table.id = "table4";
            let row1 = table.insertRow();
            for(let i = 0; i < 6; i++){
                let cell = row1.insertCell();
                cell.innerText = i + 1;
            }
            row1 = table.insertRow();
            let values = {};
            for(let i = 0; i < 6; i++){
                let cell = row1.insertCell();
                cell.style.textAlign = "right";
                cell.innerText = Math.round(parseFloat(exam["points"] * base.percentages[i]));
                values[i] = Math.round(parseFloat(exam["points"] * base.percentages[i]));
            }
            let labeln = document.createElement("label");
            cell3.innerText = "Notenschlüssel: ";
            cell3.appendChild(table);
            exam_element.appendChild(inner_table);
            main.appendChild(exam_element);
            base.create_student_table(exam, main);
            /**
             *
             *             <div class="panel">
             *                 <table style="width: 100%; align-content: center; text-align: center; background: transparent">
             *                     <tr>
             *                         <td>Sophia Melf</td>
             *                         <td>
             *                             <label for="form4" style="margin-top: 10px">Punkte:</label>
             *                             <input id="form4" style="margin-top: 10px;width: 75px; text-align: center" type="number" value="32" onkeyup="do_something">
             *                         </td>
             *                         <td>Note: 3</td>
             *                     </tr>
             *                 </table>
             *             </div>
             * @type {HTMLDivElement}
             */
        }
    }

    create_student_table(exam, main){
        let panel = document.createElement("div");
        panel.className = "panel";
        let student_table = document.createElement("table");
        student_table.style.width = "100%";
        student_table.style.alignContent = "center";
        student_table.style.textAlign = "center";
        student_table.style.background = "transparent";
        for(let student of base.students){
            let row = student_table.insertRow();
            // Name
            let cell = row.insertCell();
            cell.innerText = student["name"];
            cell = row.insertCell();
            cell.style.width = "45%";
            let label = document.createElement("label");
            label.htmlFor = student["name"];
            label.style.marginTop = "10px";
            label.innerText = "Punkte:";
            cell.appendChild(label);
            // <input id="form4" style="margin-top: 10px;width: 75px; text-align: center"
            // type="number" value="32" onkeyup="do_something">
            let input = document.createElement("input");
            input.id = student["name"];
            input.style.marginTop = "10px";
            input.style.width = "75px";
            input.style.textAlign = "center";
            input.type = "number";
            input.min = 0;
            input.max = exam["points"];
            input.setAttribute("student", student["name"]);
            input.setAttribute("exam", exam["name"]);
            let yet_grade = base.check_student_grade(student, exam);
            if(yet_grade !== null){
                input.value = parseInt(yet_grade[0]);
            }else{
                input.value = "";
            }
            input.setAttribute("onchange", "base.update_student_grade(this)");
            // Add onkeyup
            cell.appendChild(input);
            cell = row.insertCell();
            cell.style.width = "25%";
            cell.id = student["name"] + "_" + exam["name"];
            cell.innerText = yet_grade !== null ? "Note: " + parseInt(yet_grade[1]) : "";
        }
        panel.appendChild(student_table);
        let a = document.createElement("div");
        a.id = "canvas_container_" + exam["name"];
        main.appendChild(panel);
        main.appendChild(a);
    }

    update_canvas(exam){
        let parent = document.getElementById("canvas_container_" + exam["name"]);
        let c = document.getElementById("canvas_element");
        if(c !== null){
            parent.removeChild(c);
        }
        let canvas = document.createElement("canvas");
        canvas.id = "canvas_element";
        let canvasWidth = 400;
        let canvasHeight = 350;
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        canvas.style.alignSelf = "center";
        canvas.style.width = canvasWidth;
        canvas.style.height = canvasHeight;
        let cv = canvas.getContext("2d");
        //Options Grid
        let graphGridSize = 20;
        let graphGridX = (canvasWidth / graphGridSize).toFixed();
        //Draw Grid
        for(let i = 0; i < graphGridX; i ++){
            cv.moveTo(canvasWidth, graphGridSize*i);
            cv.lineTo(0, graphGridSize*i);
        }
        cv.strokeStyle = "#dbdbdb";
        cv.stroke();

        let d = base.calc_canvas_values(exam);
        var data = { "values":[
                {A: "1", "B": d[0], C: "#1ed327"},
                {A: "2", "B": d[1], C: "#00ff2a"},
                {A: "3", "B": d[2], C: "#dcff42"},
                {A: "4", "B": d[3], C: "#f3af25"},
                {A: "5", "B": d[4], C: "#ff6100"},
                {A: "6", "B": d[5], C: "#ff0000"},
            ]};
        //Options Graph
        var graphMax = base.students.length;
        var graphPadding = 10;
        var graphFaktor = (canvasHeight-(2*graphPadding)) / graphMax * 2;
        var graphWidth = (canvasWidth-graphPadding) / data.values.length;
        var graphTextcolor = '#000000';
        //Draw Graph
        for(var i = 0; i < data.values.length; i ++){
            let tmpTop = (canvasHeight-(graphFaktor*data["values"][i]["B"])).toFixed()-graphPadding;
            let tmpHeight = ((data["values"][i]["B"]*graphFaktor)).toFixed();
            cv.fillStyle = data.values[i].C;
            cv.fillRect(graphWidth+((i-1)*graphWidth)+graphPadding, tmpTop, graphWidth-graphPadding, tmpHeight);
            cv.fillStyle = graphTextcolor;
            cv.fillText(data.values[i].A, graphWidth+((i-1)*graphWidth)+graphPadding+2, canvasHeight-2, graphWidth);
        }




        parent.appendChild(canvas);
    }

    calc_canvas_values(exam){
        let grades = [0, 0, 0, 0, 0, 0];
        for(let student of base.students){
            let grade = base.check_student_grade(student, exam);
            if(grade != null){
                grades[grade[1] - 1]++;
            }
        }
        return grades;
    }

    get_exam(name){
        for(let exam of base.exams){
            if(exam["name"] === name)
                return exam;
        }
        return null;
    }

    get_student(name){
        for(let student of base.students){
            if(student["name"] === name)
                return student;
        }
        return null;
    }

    /**
     * Checks whether the given student has already a grade in section and exam or not
     */
    check_student_grade(student, exam){
        let one = student["grades"][exam["section"]];
        if(one === undefined)
            return null;
        let two = one[exam["name"]];
        if(two === undefined)
            return null;
        return two;
    }

    update_student_grade(calling){
        if(calling.value.length === 0)
            return;
        let student = base.get_student(calling.getAttribute("student"));
        let exam = base.get_exam(calling.getAttribute("exam"));
        let points = parseInt(calling.value);
        let grade;
        for(let i = 0; i < 6; i++){
            if(points >= exam["keys"][i]){
                grade = i + 1;
                break;
            }
        }
        let target = document.getElementById(student["name"] + "_" + exam["name"]);
        target.innerText = "Note: " + grade;
        if(student["grades"][exam["section"]] === undefined){
            student["grades"][exam["section"]] = {}
        }
        student["grades"][exam["section"]][exam["name"]] = [points, grade];
        base.save_information();
        base.update_canvas(exam);
    }

    accordion_table(){
        let acc = document.getElementsByClassName("accordion");
        for (let i = 0; i < acc.length; i++) {
            acc[i].addEventListener("click", function() {
                this.classList.toggle("active");
                let panel = this.nextElementSibling;
                if(panel === null)
                    return;
                if (panel.style.maxHeight) {
                    panel.style.maxHeight = null;
                } else {
                    panel.style.maxHeight = panel.scrollHeight + "px";
                }
            });
        }
    }
}