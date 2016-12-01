<#import "../application/layout.ftl" as application>
<@application.layout>
<h1>
<#if id?? >
	Editing ${name}
<#else>
	Create a new Person
</#if>
</h1>







<form id="personForm">
	<div class="form-group">
		<label for="type">Person's name <small>(First Name, Last Name)</small></label>
		<input type="text" name="name" value="${name!}" />
	</div>
	<section class="anet-block">
		<div class="anet-block__title">
			Billet Information
		</div>
		<div class="anet-block__body">
			<div class="row">
				<div class="col-md-6">
					<div class="form-group">
						<label for="role">Role</label>
						<select name="role">
							<option value="PRINCIPAL" <#if role?? && role == 'PRINCIPAL'>selected</#if>>Principal</option>
							<option value="ADVISOR" <#if role?? && role == 'ADVISOR'>selected</#if>>Advisor</option>
							<option value="USER" <#if role?? && role == 'USER'>selected</#if>>User</option>
						</select>
					</div>
				</div>
				<div class="col-md-6">
					<div class="form-group">
						<label for="status">Status</label>
						<select name="status" >
							<option value="ACTIVE" <#if status?? && status == 'ACTIVE'>selected</#if>>Active</option>
							<option value="INACTIVE" <#if status?? && status == 'INACTIVE'>selected</#if>>Inactive</option>
						</select>
					</div>
				</div>
			</div>
			<div class="row">
				<div class="col-md-6">
					<div class="form-group">
					<label for="emailAddress">Email</label>
					<input type="text" name="emailAddress" value="${emailAddress!}" />
					</div>
				</div>
				<div class="col-md-6">
					<div class="form-group">
						<label for="phoneNumber">Phone Number</label>
						<input type="text" name="phoneNumber" value="${phoneNumber!}" />
					</div>
				</div>
			</div>
			<div class="row">
				<div class="col-md-6">
					<div class="form-group">
					<label for="rank">Rank</label>
					<input type="text" name="rank" value="${rank!}" />
					</div>
				</div>
				<div class="col-md-6">
					<div class="form-group">
						<label for="bio">Bio</label>
						<textarea rows=3 id="bio" value="${billetNumber!}" name="biography" >${biography!}</textarea>
					</div>
				</div>
			</div>
		</div>
	</section>

	<#if id??>
	<input type="hidden" name="id" value="${id}" />
	</#if>
	<#if id?? >
		<input type="submit" id="personSaveBtn" value="Save Changes" class="btn btn-default pull-right">
	<#else>
		<input type="submit" id="personSaveBtn" value="Save Billet" class="btn btn-default pull-right">
	</#if>

</form>

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
