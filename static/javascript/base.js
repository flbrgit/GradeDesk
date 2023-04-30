class Base{
    constructor() {
        let item = localStorage.getItem("category");
        this.category = item != null ? item : null;
        this.all_categories = ["grades", "points"];
        this.percentages = [0.95, 0.8, 0.65, 0.5, 0.35, 0.0];
        this.grade_colors = {
            1: "#1ed327",
            2: "#00ff2a",
            3: "#dcff42",
            4: "#f3af25",
            5: "#ff6100",
            6: "#ff0000",
        }
        this.saved_name = "";
        this.retrieve_information();
        document.onload = this.update;
    }

    export_data(){
        let data = JSON.stringify([JSON.stringify(this.students), JSON.stringify(this.sections), JSON.stringify(this.exams)]);
        let name = prompt("Bitte Dateinamen eingeben:", this.saved_name);
        if (name != null) {
            download(data, name + ".gradedesk", "plaintext");
            this.saved_name = name;
            this.save_information();
        }
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
        localStorage.setItem("saved_name", this.saved_name);
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
        this.saved_name = localStorage.getItem("saved_name");
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
                cell.innerHTML = "<img alt='error' src='static/images/verboten.png' " +
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
            cell.innerHTML = "<img alt='error' src='static/images/verboten.png' " +
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
                    if(infos !== null && infos[i] !== undefined)
                        cell.title = infos[i];
                    cell.style.cursor = "context-menu";
                    section_list.push(infos !== null && i < infos.length ? parseInt(yet_grade[infos[i]][1]) : "");
                }
                cell = row.insertCell();
                cell.innerText = this.calculate_average(section_list);
                cell.setAttribute("name", "section_grade");
                cell.style.background = this.grade_colors[parseInt(this.calculate_average(section_list))];
                cell_list.push(this.calculate_average(section_list));
            }
            cell = row.insertCell();
            cell.style.minWidth = "20px";
            cell.innerText = this.calculate_average(cell_list);     //"⌀ " +
            let color = "#44c8f8";
            cell.style.background = "linear-gradient(to right, #44c8f8 1%, " + this.grade_colors[parseInt(this.calculate_average(cell_list))] + " 100%)";       // ;
            if(this.calculate_average(cell_list) - Math.round(this.calculate_average(cell_list)) === -0.5) {
                cell.style.fontWeight = "bold";
                cell.style.fontStyle = "italic";
            }
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
            cell.innerText = parseInt(parseFloat(points * base.percentages[i]));
            values[i] = parseInt(parseFloat(points * base.percentages[i]));
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
            values[i] = parseInt(parseFloat(points * base.percentages[i]));
        }
        let used = 0;
        for(let exam of base.exams){
            if(exam["section"] === section)
                used += 1;
        }
        let sections = [];
        for(let s of base.sections){
            if(s["name"] === section && used >= s["columns"]){
                s["columns"] += 1;
            }
            sections.push(s);
        }
        let exam = {"name": name, "points": parseInt(points),
            "section": section, "keys": values}
        base.sections = sections;
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
            exam_element.id = "exam_element_" + exam["name"];
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
            inner_table.id = "table5_" + exam["name"];
            let row = inner_table.insertRow();
            row.id = "row_" + exam["name"];
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
                cell.innerText = parseInt(parseFloat(exam["points"] * base.percentages[i]));
                values[i] = parseInt(parseFloat(exam["points"] * base.percentages[i]));
            }
            cell3.innerText = "Notenschlüssel: ";
            cell3.appendChild(table);
            let cell4 = row.insertCell();
            cell4.innerText = "Prüfung löschen";
            /**
             * "<img alt='error' src='static/images/verboten.png' " +
             *                     "width='30' " +
             *                     "onclick='base.delete_section(\"" + section["name"] + "\")'/>";
             */
            let img = document.createElement("img");
            img.alt = "delete";
            img.src = "static/images/verboten.png";
            img.width = "30";
            img.setAttribute("onclick", "base.delete_exam(this)");
            img.setAttribute("exam_name", exam["name"]);
            cell4.appendChild(document.createElement("br"));
            cell4.appendChild(img);
            let cell5 = row.insertCell();
            cell5.innerHTML = "<p>Prüfung drucken</p>";
            let print = document.createElement("button");
            print.innerText = "Prüfung drucken";
            print.setAttribute("onclick", "base.print(this);");
            print.setAttribute("exam", exam["name"]);
            print.id = "print_" + exam["name"];
            cell5.appendChild(print);
            exam_element.appendChild(inner_table);
            main.appendChild(exam_element);
            base.create_student_table(exam, main);
        }
    }

    print(calling){
        let exam = base.get_exam(calling.getAttribute("exam"));
        let prtContent = document.getElementById("panel_" + exam["name"]);
        let WinPrint = window.open('', '', 'left=0,top=0,width=800,height=900,toolbar=0,scrollbars=0,status=0');
        // exam["name"] + "_" + student["name"]
        for(let student of base.students){
            let temp = document.getElementById(exam["name"] + "_" + student["name"]);
            let label = document.getElementById("label_" + exam["name"] + "_" + student["name"]);
            let neu = document.createElement("p");
            neu.innerText = "Punkte: " + temp.value;
            temp.parentNode.replaceChild(neu, temp);
            neu.parentNode.removeChild(label);
        }
        let before = document.getElementById("exam_element_" + exam["name"]);
        let table = document.getElementById("row_" + exam["name"]);
        table.deleteCell(4);
        table.deleteCell(3);
        table.parentNode.replaceChild(table, table);
        WinPrint.document.write(before.innerHTML + prtContent.innerHTML);
        WinPrint.document.close();
        WinPrint.focus();
        WinPrint.print();
        WinPrint.close();
        location.reload();
        /*
        var myAnchor = document.getElementById("myAnchor");
        var mySpan = document.createElement("span");
        mySpan.innerHTML = "replaced anchor!";
        myAnchor.parentNode.replaceChild(mySpan, myAnchor);


        var divContents = document.getElementById("exam_panel").innerHTML;
        var a = window.open('', '', 'height=0, width=0');
        a.document.write('<html>');
        a.document.write('<body >');
        a.document.write(divContents);
        a.document.write('</body></html>');
        a.document.close();
        a.print();
         */
    }

    delete_exam(calling){
        let exam = base.get_exam(calling.getAttribute("exam_name"));
        let c = confirm("Prüfung '" + exam["name"] + "' wirklich löschen?");
        if (!c)
            return;
        base.retrieve_information();
        // Delete exam out of students
        for(let student of base.students){
            for(let section of Object.keys(student["grades"])){
                let temp = student["grades"][section];
                if(exam["name"] in temp){
                    // console.log(student["grades"][section][exam["name"]]);
                    delete student["grades"][section][exam["name"]];
                }
            }
        }
        // Delete out of exams
        let exams = [];
        for(let e of base.exams){
            if(e["name"] !== exam["name"])
                exams.push(e);
        }
        // exams.push(exam);
        console.log(exams);
        base.exams = exams;
        base.save_information();
        location.reload();
    }

    create_student_table(exam, main){
        let panel = document.createElement("div");
        panel.className = "panel";
        panel.id = "panel_" + exam["name"];
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
            label.id = "label_" + exam["name"] + "_" + student["name"];
            cell.appendChild(label);
            // <input id="form4" style="margin-top: 10px;width: 75px; text-align: center"
            // type="number" value="32" onkeyup="do_something">
            let input = document.createElement("input");
            input.id = exam["name"] + "_" + student["name"];
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
            if(yet_grade !== null){
                cell.style.background = base.grade_colors[parseInt(yet_grade[1])];
                // cell.style.fontSize = "18px";
                // cell.style.textShadow = "1px 1px 1px black, 1px -1px 1px black, -1px 1px 1px black, -1px -1px 1px black";
            }
        }
        let row = student_table.insertRow();
        let cell = row.insertCell();
        cell.id = "canvas_container_cell_" + exam["name"];
        cell.style.height = "350px";
        let canvas = document.createElement("canvas");
        canvas.id = "canvas_element_" + exam["name"];
        cell.appendChild(canvas);
        cell = row.insertCell();
        cell.id = "canvas_stats_cell_" + exam["name"];
        panel.appendChild(student_table);
        main.appendChild(panel);
        base.update_canvas(exam);
        base.update_grade_statistics(exam);
    }

    update_grade_statistics(exam){
        let cell = document.getElementById("canvas_stats_cell_" + exam["name"]);
        removeChildren(cell);
        let dl = document.createElement("dl");
        dl.style.display = "table";
        let d = base.calc_canvas_values(exam);
        let sum = 0;
        for(let value of d){
            sum += value;
        }
        let av = 0;
        for(let i = 0; i < 6; i++){
            av += d[i] * (i + 1);
        }
        for(let i = 0; i < 6; i++){
            let div = document.createElement("div");
            div.style.display = "table-row";
            div.style.fontWeight = "normal";
            let dt = document.createElement("dt");
            dt.innerText = "Note " + (i + 1) + ": ";
            dt.style.width = "150px";
            dt.style.textAlign = "center";
            dt.style.fontWeight = "normal";
            div.appendChild(dt);
            let dd = document.createElement("dt");
            let percentage = Number((d[i] / sum * 100).toFixed(1)) + "%";
            dd.innerText = d[i] + "x (" + percentage + ")";
            dd.style.display = "table-cell";
            dd.style.width = "200px";
            dd.style.textAlign = "right";
            dd.style.border = "transparent";
            dd.style.padding = "0.25em";
            dd.style.fontWeight = "normal";
            div.appendChild(dd);
            dl.appendChild(div);
        }
        let div = document.createElement("div");
        div.style.display = "table-row";
        let dt = document.createElement("dt");
        dt.innerText = "Durchschnitt: ";
        dt.style.width = "150px";
        dt.style.textAlign = "center";
        div.appendChild(dt);
        let dd = document.createElement("dt");
        dd.innerText = Number((av / sum).toFixed(1));
        dd.style.display = "table-cell";
        dd.style.width = "200px";
        dd.style.textAlign = "right";
        dd.style.border = "transparent";
        dd.style.padding = "0.25em";
        div.appendChild(dd);
        dl.appendChild(div);
        let headline = document.createElement("p");
        /**
         * font-size: 20px;
         * font-style: oblique;
         */
        headline.innerText = "Statistiken";
        headline.style.fontSize = "20px";
        headline.style.fontStyle = "oblique";
        cell.appendChild(headline);
        cell.appendChild(dl);
    }

    update_canvas(exam){
        let parent = document.getElementById("canvas_container_cell_" + exam["name"]);
        let c = document.getElementById("canvas_element_" + exam["name"]);
        if(c !== null){
            parent.removeChild(c);
        }
        let canvas = document.createElement("canvas");
        canvas.id = "canvas_element_" + exam["name"];
        canvas.className = "canvas";
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
        let data = { "values":[
                {A: "1", "B": d[0], C: base.grade_colors[1]},
                {A: "2", "B": d[1], C: base.grade_colors[2]},
                {A: "3", "B": d[2], C: base.grade_colors[3]},
                {A: "4", "B": d[3], C: base.grade_colors[4]},
                {A: "5", "B": d[4], C: base.grade_colors[5]},
                {A: "6", "B": d[5], C: base.grade_colors[6]},
            ]};
        //Options Graph
        let graphMax = Math.max.apply(null, d);
        if(graphMax < 5)
            graphMax = 4;
        let graphPadding = 10;
        let graphFaktor = (canvasHeight-(2*graphPadding)) / graphMax;
        let graphWidth = (canvasWidth-graphPadding) / data.values.length;
        let graphTextcolor = '#000000';
        //Draw Graph
        for(let i = 0; i < data.values.length; i ++){
            let tmpTop = (canvasHeight-(graphFaktor*data["values"][i]["B"])).toFixed()-graphPadding;
            let tmpHeight = ((data["values"][i]["B"]*graphFaktor)).toFixed();
            cv.fillStyle = data.values[i].C;
            cv.fillRect(graphWidth+((i-1)*graphWidth)+graphPadding, tmpTop, graphWidth-graphPadding, tmpHeight);
            cv.fillStyle = graphTextcolor;
            cv.fillText(data.values[i].A, graphWidth+((i-1)*graphWidth)+graphPadding+2, canvasHeight-2, graphWidth);
        }

        const img = canvas.toDataURL('image/png');
        let image = document.createElement("img");
        image.src = img;

        parent.appendChild(image);
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

    get_section(name){
        for(let section of base.sections){
            if(section["name"] === name)
                return section;
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
        target.style.background = base.grade_colors[grade];
        student["grades"][exam["section"]][exam["name"]] = [points, grade];
        base.save_information();
        base.update_canvas(exam);
        base.update_grade_statistics(exam);
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