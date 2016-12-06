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
<#if id??><input type="hidden" name="id" value="${id}" /></#if>
<div class="form-group">
	<label for="type">Type: ${positionName}</label>
</div>

<section class="anet-block">
	<div class="anet-block__title">
		${positionName} Information
	</div>
	<div class="anet-block__body">
		<div class="row">
			<div class="col-md-12">
				<div class="form-group">
				<label for="code">${positionName} Code</label>
				<input id="code" name="code" value="${code!}" />
				</div>
			</div>
		</div>
		<div class="row">
			<div class="col-md-6">
				<div class="form-group">
				<label for="name">${positionName} name</label>
				<textarea rows=3 id="name" name="name" >${name!}</textarea>
				</div>
			</div>
			<div class="col-md-6">
				<div class="form-group">
					<marquee><label for="billetNumber">Responsibilities NO EXIST</label></marquee>
					<textarea rows=3 id="billetNumber" value="" style="background-color:red"></textarea>
				</div>
			</div>
		</div>
		<div class="row">
			<div class="col-md-6">
				<div class="form-group">
				<label for="location">Location</label>
				<select name="location" id="positionLocationSelect" >
					<#if location??>
						<option value="${location.id}">${location.name}</option>
					</#if>
				</select>
				</div>
			</div>
			<div class="col-md-6">
				<div class="form-group">
					<marquee><label for="billetNumber">Experience NO EXIST</label></marquee>
					<textarea rows=3 id="billetNumber" style="background-color:red"></textarea>
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
					<label for="org">Assigned Organization</label>
					<select name="org" id="orgSelect" >
						<#if organization??>
						<option value="${organization.id}" selected>${organization.name}</option>
						</#if>
					</select>
				</div>
			</div>
			<div class="col-md-6">
				<div class="form-group">
					<label for="billetNumber">Role	</label>
					<#if type?? && type =='PRINCIPAL'>
						<input type="hidden" name="type" value="PRINCIPAL" />
					<#else>
						<input type="hidden" name="type" value="ADVISOR" />
						<select style="background-color:red" id="roleSelect" >
							<option value="">Read Only</option>
							<option selected value="">Advisor</option>
							<option value="">SuperUser</option>
							<option value="">Systems Admin</option>
						</select>
					</#if>
				</div>
			</div>
		</div>
	</div>
</section>

<section class="anet-block">
	<div class="anet-block__title">
		${otherPositionName} Assignment
	</div>
	<div class="anet-block__body">
		<div class="row">
			<div class="col-md-12">
				<div class="form-group">
					<label for="relatedPosition">Assign a ${otherPositionName} to this ${positionName}</label>
					<select id="relatedPositionSelect" >
						<option>TODO: Search for ${otherPositionName}s</option>
					</select>
				</div>
			</div>
		</div>
		<div class="row">
			<div class="col-md-12">
				<table>
					<tr>
						<th>${otherPositionType} Name</th>
						<th>${otherPositionName} Number</th>
					</tr>
					<#list associatedPositions as position>
						<tr>
							<td>
								<#if position.person??>
									${position.person.name}
								<#else>
									<i>No person assigned</i>
								</#if>
							</td>
							<td><a href="/positions/${position.id}">${position.name}</a></td>
							<td><a class="removePositionLink" data-id="${position.id}">[Remove]</a></td>
						</tr>
					</#list>
				</table>
			</div>
		</div>
	</div>
</section>
</form>

<#if id?? >
	<input type="submit" id="saveBtn" value="Save Changes" class="btn btn-default pull-right">
<#else>
	<input type="submit" id="saveBtn" value="Save ${positionName}" class="btn btn-default pull-right">
</#if>


<script type="text/javascript">
$(document).ready(function() {
	enableLocationSearch("#positionLocationSelect");
	$("#orgSelect").select2({
		dropdownParent: $(".mainbody"),
		ajax: {
			url: "/organizations/search",
			dataType: 'json',
			delay: 250,
			method: 'GET',
			data: function(params) {
				var type = "${type}_ORG";
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
		if (position["location"]) { 
			position["location"] = { id: position["location"] };
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