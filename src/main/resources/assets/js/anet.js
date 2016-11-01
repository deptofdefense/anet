function jsonForm(formName) {
	return JSON.stringify(buildForm(formName));
}

function buildForm(formName) { 
	form = $("#" + formName).serializeArray();
	out = {}
	for (i in form) { 
		out[form[i]["name"]] = form[i]["value"];
	}
	return out;
}
