<#-- @ftlvariable name="" type="mil.dds.anet.beans.Report" -->
<#import "../application/layout.ftl" as application>
<@application.layout>

<form id="reportForm">
	<input data-report-id type="hidden" name="id" value="${id!}">

	<div class="row">
		<div class="col-xs-12">
			<p class="pull-left">
				<#if id??>Editing<#else>Submitting</#if> as ${context.currentUser.name}
				<#if author??><br>Report Author: ${author.name}</#if>
			</p>
			<input type="submit" value="Save report" class="btn btn-default pull-right">
		</div>
	</div>

	<section class="anet-block">
		<div class="anet-block__title">
			Report details
		</div>

		<div class="anet-block__body">
			<div class="form-group">
				<label for="engagementIntent">Subject of meeting</label>
				<input id="engagementIntent" name="intent" value="${intent!}" />
			</div>

			<div class="row">
				<div class="col-md-6">
					<div class="form-group">
						<label for="engagementDate">Engagement date</label>
						<div data-datepicker></div>
					</div>
				</div>
				<div class="col-md-6">
					<div class="form-group">
						<label for="engagementLocation">Engagement location</label>
						<select id="engagementLocation" name="location_id" style="width:100%">
							<#if location??>
							<option value="${location.id}">${location.name}</option>
							</#if>
						</select>
					</div>

					<div class="form-group engagement-atmosphere">
						<label for="engagementAtmosphere">Atmosphere of engagement</label>
						<input type="radio" name="atmosphere" id="atmospherePositive" value="positive">
						<#-- <label for="atmospherePositive">😃</label> -->
						<label for="atmospherePositive"><btn>Positive</btn></label>
						<input type="radio" name="atmosphere" id="atmosphereNeutral" value="neutral">
						<#-- <label for="atmosphereNeutral">😐</label> -->
						<label for="atmosphereNeutral">Neutral</label>
						<input type="radio" name="atmosphere" id="atmosphereNegative" value="negative">
						<#-- <label for="atmosphereNegative">😡</label> -->
						<label for="atmosphereNegative">Negative</label>
						<!-- <input type="radio" name="atmosphere" id="atmosphereNegative" value="negative">
						<label for="atmosphereNegative">💩🔥</label> -->
					</div>

					<div class="form-group <#if !atmosphereDetails??>hide</#if>" data-atmosphere-details>
						<label for="engagementAtmosphereDetails">Atmospheric details</label>
						<input id="engagementAtmosphereDetails" name="atmosphereDetails" value="${atmosphereDetails!}">
					</div>
				</div>
			</div>
		</div>
	</section>

	<section class="anet-block">
		<div class="anet-block__title">
			People involved
		</div>

		<div class="anet-block__body">
			<div class="form-group">
				<label for="attachPersonName">Who was present?</label>
				<select id="attachPersonName" style="width: 100%"></select>
			</div>

			<div class="form-group hide" data-attach-new-person>
				<div class="col-md-6">
					<input type="radio" value="advisor" name="attachPersonType" id="attachPersonTypeAdvisor">
					<label for="attachPersonTypeAdvisor">Advisor</label>
					<input type="radio" value="principal" name="attachPersonType" id="attachPersonTypePrincipal">
					<label for="attachPersonTypePrincipal">Afghan Principal</label>
					<input type="radio" value="other" name="attachPersonType" id="attachPersonTypeOther">
					<label for="attachPersonTypeOther">Other</label>
				</div>

				<div class="col-md-6">
					<label for="attachPersonGroup">Organizational group</label>
					<select id="attachPersonGroup"></select>
					<button type="button" class="usa-button pull-right" data-attach-new-person-submit>Add Person</button>
				</div>
			</div>

			<div class="form-group">
				<table class="usa-table-borderless">
					<thead>
						<tr>
							<th></th>
							<th>Name</th>
							<th>Role</th>
						</tr>
					</thead>
					<#if attendees??>
						<#list attendees as a>
							<tr data-id="${a.id}">
								<td>
									<button type="button" class="usa-button-unstyled" data-remove>
										<i class="glyphicon glyphicon-remove"></i>
									</button>
								</td>
								<td data-attribute="name">${a.name}</td>
								<td data-attribute="role">${a.role}</td>
							</tr>
						</#list>
					</#if>
					<tr data-attached-person-prototype>
						<td>
							<button type="button" class="usa-button-unstyled" data-remove>
								<i class="glyphicon glyphicon-remove"></i>
							</button>
						</td>
						<td data-attribute="name"></td>
						<td data-attribute="role"></td>
					</tr>
				</table>
			</div>
		</div>
	</section>

	<section class="anet-block">
		<div class="anet-block__title">
			Discussion
		</div>

		<div class="anet-block__body">
			<div class="form-group">
				<label for="engagementDetails">Describe the discussion in detail</label>
				<textarea id="engagementDetails" name="reportText">${reportText!}</textarea>
			</div>

			<div class="form-group">
				<label for="engagementNextSteps">Recommended next steps?</label>
				<textarea id="engagementNextSteps" name="nextSteps">${nextSteps!}</textarea>
			</div>
		</div>
	</section>

	<section class="anet-block">
		<div class="anet-block__title">
			Essential functions and milestones
		</div>

		<div class="anet-block__body">
			<div class="row">
				<div class="col-md-6">
					<div class="form-group">
						<label for="attachEFName">Essential function</label>
						<select id="attachEFName">
							<option></option>
							<#list context.efs as ef>
							<option value="${ef.id}">${ef.shortName} - ${ef.longName}</option>
							</#list>
						</select>
					</div>

					<div class="form-group">
						<label for="attachEFMilestones">Milestones</label>
						<select id="attachEFMilestones">
							<option></option>
						</select>
					</div>
				</div>

				<div class="col-md-6">
					<table>
						<tr>
							<th>
							<th>EF</th>
							<th>POAM</th>
						</tr>
						<tr data-attached-poam-prototype>
							<td>
								<button type="button" class="usa-button-unstyled" data-remove>
									<i class="glyphicon glyphicon-remove"></i>
								</button>
							</td>
							<td data-attribute="ef"></td>
							<td data-attribute="poam"></td>
						</tr>
					</table>
				</div>
			</div>
		</div>
	</section>

	<input type="submit" value="Save report" class="btn btn-default pull-right">
</form>

<script type="text/javascript">
$(document).ready(function() {
	initializeDates();

	enablePersonSearch("#afghanPrincipal","PRINCIPAL");
	enablePersonSearch("#attachPersonName","");
	enableLocationSearch("#engagementLocation");

	var poamAttacher = new ResourceAttacher('poam');
	var selectedPoam = {};

	$('#attachEFName').select2({
		dropdownParent: $('.mainbody'),
		placeholder: 'Select an EF'
	});

	$('#attachEFMilestones').select2({
		placeholder: 'Select an EF first'
	})

	$('#attachEFName').on('select2:select', function (event) {
		var efId = this.value;
		selectedPoam.ef = this.options[this.selectedIndex].innerHTML;
		$.ajax({
			url: '/poams/' + efId + '/children?cat=Milestone',
			method: 'GET'
		}).done(function(response) {
			var results = _.map(response, function(poam) {
				return {
					id: poam.id,
					text: poam.shortName + " - " + poam.longName
				};
			});
			$('#attachEFMilestones').html('<option></option>');
			$('#attachEFMilestones').select2({
				data: results,
				dropdownParent: $('.mainbody'),
				placeholder: 'Select a POAM'
			});
		});
	});

	$('#attachEFMilestones').on('select2:select', function(event) {
		selectedPoam.id = this.value;
		selectedPoam.poam = this.options[this.selectedIndex].innerHTML;
		poamAttacher.attachResource(selectedPoam)
	});

	$('#personForm').on('submit', submitForm);

	var $atmosphereDetails = $('[data-atmosphere-details]')
	$('[name=atmosphere]').on('change', function() {
		$atmosphereDetails.toggleClass('hide', this.value === 'positive');
	});

	var personAttacher = new ResourceAttacher('person');

	var $attachPersonForm = $('[data-attach-new-person]');
	var $attachPersonSubmit = $('[data-attach-new-person-submit]');
	var addingPerson = {};

	function enablePersonSearch(selectId, role) {
		$(selectId).select2({
			dropdownParent: $(".mainbody"),
			ajax: {
				url: "/people/search",
				dataType: 'json',
				delay: 250,
				method: 'GET',
				data: function(params) {
					return {q: params.term, role: role}
				},
				processResults: function(data, params) {
					var names = [];
					if (role !== 'PRINCIPAL') {
						names.push({id:'-1', text: "Create new person named " + params.term, query: params.term});
					}

					data.forEach(function(person) {
						person.name = person.name;
						names.push({
							id: person.id,
							text: person.name + " " + person.rank + " - " + person.role,
							person: person
						});
					});

					return {results: names};
				}
			},
			minimumInputLength: 2
		}).on('select2:close', function(data) {
			var $this = $(this);
			var result = $this.select2('data')[0];
			if (!result) return;

			if (result.person) {
				var person = result.person;
				personAttacher.attachResource(person);
				$('#attachPersonName').val('').trigger('change');
			} else if (result.query) {
				addingPerson = {name: result.query};
				$attachPersonForm.removeClass('hide');
			}
		});
	};

	$attachPersonSubmit.on('click', function() {
		var $checkedRole = $attachPersonForm.find(':checked');
		addingPerson.role = $checkedRole.val().toUpperCase();
		personAttacher.attachResource(addingPerson);
		$checkedRole.val('');
		$attachPersonForm.addClass('hide');
		$('#attachPersonName').val('').trigger('change');
		return false;
	});

	function submitForm() {
		var report = buildForm("reportForm");
		var id = $('[data-report-id]').val();

		if (report["location_id"]) {
			report["location"] = { id: report["location_id"] }
			delete report["location_id"];
		}

		report["attendees"] = $.map(personAttacher.attachedResources, function (person) {
			//TODO: the UI should have some clue as to who is the 'primary' principal...
			return {id: person.id, primary: false};
		});

		//TODO: @nickjs: for some reason the <form id="reportForm> is missing like half the elements, can you investigate?
		report['atmosphere'] = $("[name=atmosphere]").val();
		report['atmosphereDetails'] = $("[name=atmosphereDetails]").val();
		report['reportText'] = $("[name=reportText]").val();
		report['nextSteps'] = $("[name=nextSteps]").val();

		$.ajax({
			url: id ? '/reports/' + id + '/edit' : '/reports/new',
			method: "POST",
			contentType: "application/json",
			data: JSON.stringify(report)
		}).done( function (response) {
			window.location = "/reports/" + id || response.id;
		});

		return false;
	}
});

</script>

</@application.layout>
