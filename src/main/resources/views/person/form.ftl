<#import "../application/layout.ftl" as application>
<@application.layout>
<h1>
<#if id?? >
	Editing ${firstName}
<#else>
	Create a new Person
</#if>
</h1>

<form id="personForm" >
First Name: <input type="text" name="firstName" value="${firstName!}" /><br>
Last Name: <input type="text" name="lastName" value="${lastName!}"  /><br>
Email Address: <input type="text" name="emailAddress" value="${emailAddress!}" /><br>
Phone Number: <input type="text" name="phoneNumber" value="${phoneNumber!}" /><br>
Rank: <input type="text" name="rank" value="${rank!}" /><br>
Bio: <textarea name="biography" >${biography!}</textarea><br>
Status: <select name="status" >
	<option value="ACTIVE">Active</option>
	<option value="INACTIVE">Inactive</option>
</select><br>
Role: <select name="role">
	<option value="PRINCIPAL">Principal</option>
	<option value="ADVISOR">Advisor</option>
	<option value="USER">User</option>
</select><br>
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
		$.ajax({ 
			url: url, 
			method: 'POST',
			contentType: 'application/json',
			data: jsonForm("personForm")
		}).done(function (response) {
			<#if id??>
				window.location = "/people/${id}"
			<#else>
				window.location = "/people/" + response.id;
			</#if>
		});
	});
});
</script>

</@application.layout>
