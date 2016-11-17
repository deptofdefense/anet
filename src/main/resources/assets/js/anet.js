function jsonForm(formName) {
	return JSON.stringify(buildForm(formName));
}

function buildForm(formName) {
	var $form = $("#" + formName);
	var output = {};

	$form.serializeArray().forEach(function(input) {
		output[input.name] = input.value;
	});

	return output;
}
