<#import "../application/layout.ftl" as application>
<@application.layout>
<h1>
<#if id?? >
	Editing ${name}
<#else>
	Create a new Person
</#if>
</h1>

<form id="personForm" >
Name: <input type="text" name="name" value="${name!}" /><br>
Email Address: <input type="text" name="emailAddress" value="${emailAddress!}" /><br>
Phone Number: <input type="text" name="phoneNumber" value="${phoneNumber!}" /><br>
Rank: <input type="text" name="rank" value="${rank!}" /><br>
Bio: <textarea name="biography" >${biography!}</textarea><br>
Status: <select name="status" >
	<option value="ACTIVE" <#if status?? && status == 'ACTIVE'>selected</#if>>Active</option>
	<option value="INACTIVE" <#if status?? && status == 'INACTIVE'>selected</#if>>Inactive</option>
</select><br>
Role: <select name="role">
	<option value="PRINCIPAL" <#if role?? && role == 'PRINCIPAL'>selected</#if>>Principal</option>
	<option value="ADVISOR" <#if role?? && role == 'ADVISOR'>selected</#if>>Advisor</option>
	<option value="USER" <#if role?? && role == 'USER'>selected</#if>>User</option>
</select><br>
<div class="form-group">
	Location: <select name="location_id" id="personLocation" >
		<#if location??>
			<option value="${location.id}">${location.name}</option>
		</#if>
	</select>
</div>

<#if id??>
<input type="hidden" name="id" value="${id}" />
</#if>
</form>
<input type="submit" value="Save" id="personSaveBtn" />

<script type="text/javascript">
$(document).ready(function() {
	<#if id??>
		var url = '/people/update'
	<#else>
		var url = '/people/new'
	</#if>
	$("#personSaveBtn").on('click', function (event) { 
		var person = buildForm("personForm");
		if (person["location_id"]) {
			person["location"] = { id: person["location_id"] }
			delete person["location_id"];
		}
		$.ajax({ 
			url: url, 
			method: 'POST',
			contentType: 'application/json',
			data: JSON.stringify(person)
		}).done(function (response) {
			<#if id??>
				window.location = "/people/${id}"
			<#else>
				window.location = "/people/" + response.id;
			</#if>
		});
	});
	
	enableLocationSearch("#personLocation");
});
</script>

</@application.layout>
