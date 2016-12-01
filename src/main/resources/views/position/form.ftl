<#import "../application/layout.ftl" as application>
<@application.layout>
<#if type?? && type == 'ADVISOR'>
	<#assign otherPositionName = 'Tashkil'>
	<#assign otherPositionType = 'PRINCIPAL' >
	<#assign positionName = 'Billet'>
<#elseif type?? && type == 'PRINCIPAL' >
	<#assign otherPositionName = 'Billet'>
	<#assign otherPositionType = 'ADVISOR' >
	<#assign positionName = 'Tashkil'>
</#if>

<h1>
<#if id?? >
	Editing ${positionName} ${name}
<#else>
	Create a new Position
</#if>
</h1>

<form id="positionForm">
	<div class="form-group">
		<label for="type">Type</label>
		<select name="type" id="positionTypeSelect" >
			<option value="PRINCIPAL" <#if type?? && type =='PRINCIPAL'>selected</#if>>Tashkil</option>
			<option value="ADVISOR" <#if type?? && type =='ADVISOR'>selected</#if>>Advisor Billet</option>
		</select>
	</div>
</form>
<section class="anet-block">
	<div class="anet-block__title">
		Billet Information
	</div>
	<div class="anet-block__body">
		<div class="row">
			<div class="col-md-12">
				<div class="form-group">
				<label for="billetNumber">Billet Number</label>
				<input id="billetNumber" name="billetNumber" value="${billetNumber!}" />
				</div>
			</div>
		</div>
		<div class="row">
			<div class="col-md-6">
				<div class="form-group">
				<label for="billetNumber">Billet Description</label>
				<textarea rows=3 id="billetNumber" name="billetNumber" value="${billetNumber!}"></textarea>
				</div>
			</div>
			<div class="col-md-6">
				<div class="form-group">
					<label for="billetNumber">Responsibilities</label>
					<textarea rows=3 id="billetNumber" name="billetNumber" value="${billetNumber!}"></textarea>
				</div>
			</div>
		</div>
		<div class="row">
			<div class="col-md-6">
				<div class="form-group">
				<label for="billetNumber">Billet Location</label>
				<select>
				</select>
				</div>
			</div>
			<div class="col-md-6">
				<div class="form-group">
					<label for="billetNumber">Experience</label>
					<textarea rows=3 id="billetNumber" name="billetNumber" value="${billetNumber!}"></textarea>
				</div>
			</div>
		</div>
	</div>
</section>

<section class="anet-block">
	<div class="anet-block__title">
		Admin Tools
	</div>
	<div class="anet-block__body">
		<div class="row">
			<div class="col-md-6">
				<div class="form-group">
					<label for="billetNumber">Assigned AO</label>
					<select name="org" id="orgSelect" >
						<#if organization??>
						<option value="${organization.id}" selected>${organization.name}</option>
						</#if>
					</select>
				</div>
			</div>
			<div class="col-md-6">
				<div class="form-group">
					<label for="billetNumber">Responsibilities</label>
					<select name="org" id="orgSelect" >
						<option value="">Read Only</option>
						<option selected value="">Advisor</option>
						<option value="">SuperUser</option>
						<option value="">Systems Admin</option>
					</select>
				</div>
			</div>
		</div>
		<div class="row">
			<div class="col-md-12">
				<table>
					<tr>
						<th>Reporting Officer</th>
						<th>Billet number</th>
						<th>Order</th>
					</tr>
				</table>
			</div>
		</div>
	</div>
</section>

<section class="anet-block">
	<div class="anet-block__title">
		Principal Assignment
	</div>
	<div class="anet-block__body">
		<div class="row">
			<div class="col-md-12">
				<div class="form-group">
					<label for="billetNumber">Assign an Afghan principal</label>
					<select name="org" id="orgSelect" >
						<#if organization??>
						<option value="${organization.id}" selected>${organization.name}</option>
						</#if>
					</select>
				</div>
			</div>
		</div>
		<div class="row">
			<div class="col-md-12">
				<table>
					<tr>
						<th>Principal Name</th>
						<tr>Tashkil Number</tr>
					</tr>
				</table>
			</div>
		</div>
	</div>
</section>

<#if id?? >
	<input type="submit" id="saveBtn" value="Save Changes" class="btn btn-default pull-right">
<#else>
	<input type="submit" id="saveBtn" value="Save Billet" class="btn btn-default pull-right">
</#if>





<script type="text/javascript">
$(document).ready(function() {
	$("#orgSelect").select2({
		dropdownParent: $(".mainbody"),
		ajax: {
			url: "/organizations/search",
			dataType: 'json',
			delay: 250,
			method: 'GET',
			data: function(params) {
				var type = $("#positionTypeSelect").val() + "_ORG";
				return { q : params.term, type: type}
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
	$("#saveBtn").on('click', function(event) { 
		var position = buildForm("positionForm");
		if (position["org"]) { 
			position["organization"] = { id: position["org"] };
			delete position["org"]
		}
		var url = '/positions/' + <#if id??>'update'<#else>'new'</#if>
		$.ajax({ url : url,
			method: 'POST',
			contentType: 'application/json',
			data: JSON.stringify(position)
		}).done(function (response) { 
			window.location = '/positions/' + <#if id??>${id}<#else>response.id</#if>;
		});
	});
});
</script>

</@application.layout>