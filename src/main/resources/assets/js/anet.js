$(document).ready(function(){
	$('[data-toggle="tooltip"]').tooltip();
});

Date.prototype.toInputFormat = function() {
	return [this.getFullYear(), this.getMonth() + 1, this.getDate()]
		.map(function(value) {
			return value < 10 ? "0" + value : value;
		})
		.join('-');
};

function initializeDates(container) {
	if (!container) container = document;
	$(container).find('[data-date]').each(function() {
		var date = new Date(this.getAttribute('data-date'));
		this.value = date.toInputFormat();
	});

	$('[data-datepicker]').datepicker({
		todayBtn: "linked",
		todayHighlight: true,
		daysOfWeekHighlighted: "5,6"
	});
}

function jsonForm(formName) {
	return JSON.stringify(buildForm(formName));
}

function buildForm(formName) {
	var $form = $("#" + formName);
	var output = {};

	$form.serializeArray().forEach(function(input) {
		if (input.name.toLowerCase().indexOf('date') !== -1 && input.value) {
			input.value = new Date(input.value).toISOString();
		}

		output[input.name] = input.value;
	});

	return output;
}

function enableLocationSearch(selectId) {
	$(selectId).select2({
		dropdownParent: $(".mainbody"),
		ajax: {
			url: "/locations/search",
			dataType: 'json',
			delay: 250,
			method: 'GET',
			data: function(params) {
				return { q : params.term }
			},
			processResults :  function(data, params) {
				var results =_.map(data, function (el) {
					return {
						id: el["id"] ,
						text: el["name"]
					}
				});
				return { results: results };
			}
		},
		minimumInputLength : 2
	});
}

// Resource Attacher

function ResourceAttacher(resourceName) {
	this.attachedResources = {};

	this.$protoRow = $('[data-attached-' + resourceName + '-prototype]').removeAttr('data-attached-' + resourceName + '-prototype');
	this.$table = this.$protoRow.parent();
	this.$protoRow.remove();

	var _this = this;

	this.$table.find('[data-id]').each(function() {
		var $row = $(this);
		var id = $row.attr('data-id');
		var resource = {id: id};
		$row.find('[data-attribute]').each(function() {
			resource[this.getAttribute('data-attribute')] = this.innerHTML;
		});

		_this.attachedResources[id] = resource;
	});

	this.$table.on('click', '[data-remove]', function(event) {
		var id = $(this).parents('[data-id]').attr('data-id');
		var resource = _this.attachedResources[id];
		_this.removeResource(resource);
		return false;
	});
}

ResourceAttacher.prototype.attachResource = function(resource) {
	if (!resource.id)
		return;

	this.attachedResources[resource.id] = resource;
	this.renderRowForResource(resource);
}

ResourceAttacher.prototype.renderRowForResource = function(resource) {
	var id = resource.id;
	var $row = id && this.$table.find('[data-id=\'' + id + '\']');
	if (!($row && $row[0])) {
		$row = this.$protoRow.clone();
		$row.appendTo(this.$table);
	}

	$row.attr('data-id', id);
	$row.find('[data-attribute]').each(function() {
		this.innerHTML = resource[this.getAttribute('data-attribute')];
	});
}

ResourceAttacher.prototype.removeResource = function(resource) {
	var id = resource.id;
	if (!this.attachedResources[id])
		return;

	this.$table.find('[data-id=\'' + id + '\']').remove();

	this.attachedResources[id] = null;
	delete this.attachedResources[id];
}
