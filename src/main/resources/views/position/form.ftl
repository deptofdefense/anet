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
	</select><br>
	Name: <input type="text" name="name" value="${name!}" /><br>
	Organization: <select name="org" id="orgSelect" >
		<#if organization??>
			<option value="${organization.id}" selected>${organization.name}</select>
		</#if>
	</select>
	<input type="hidden" name="id" value="${id!}" />
	</div>
</form>
<input type="submit" value="Save" id="saveBtn" />


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