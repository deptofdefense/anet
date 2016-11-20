<#import "../application/layout.ftl" as application>
<@application.layout>

<section class="anet-block">
  <div class="anet-block__title">
    ${firstName} ${lastName}
    <div class="pull-right">
    	${role}
    </div>
  </div>

  <div class="anet-block__body">
    <div class="row">
      <div class="col-md-6">
       <div class="field">
       	<div class="header">Email</div>
       	<div class="content"><a href="mailto:${emailAddress}">${emailAddress}</a></div>
	   </div>
	   <div class="field">
       	<div class="header">Phone</div>
       	<div class="content"><a href="tel:${phoneNumber}">${phoneNumber}</a></div>
	   </div>
	   <div class="field">
       	<div class="header">Rank</div>
       	<div class="content">${rank}</div>
	   </div>
	   <div class="field">
       	<div class="header">Status</div>
       	<div class="content">${status}</div>
	   </div>
	  </div>
      <div class="col-md-6">
        <div class="field">
        ${biography}
        </div>
        <div class="field">
        <small>
        Created at: ${createdAt} <br>Updated at: ${updatedAt}
        </small>
        </div>
      </div>
    </div>
  </div>
</section>
<#if role == "PRINCIPAL">
	<#assign positionName = "Tashkil">
	<#assign relatedPositionName = "Advisor">
<#else>
	<#assign positionName = "Billet">
	<#assign relatedPositionName = "Principal">
</#if>
<section class="anet-block">
  <div class="anet-block__title">
    ${positionName} Settings
  </div>
   <div class="anet-block__body">
    <div class="row">
      <div class="col-md-6">
      <div class="field">

		<#if context.position??>
		${positionName} Info:
		<ul>
		<li>Id: ${context.position.id} </li>
		<li>Name: <a href="/positions/${context.position.id}">${context.position.name}</a></li>
		<li>
		<#if role == "PRINCIPAL">
			Code: ${context.position.code}
		<#else>
			Organization: 
			<#if context.position.organization?? >
				${context.position.organization.name}
			<#else>
				<i>None</i>
			</#if>
		</#if>
		</li>
		</ul>
		<#else>
		Not currently in a ${positionName}.<br>
		</#if>
		<div class="form-group">
			<label for="positionSelect">Set ${positionName}</label>
			<select id="positionSelect" name="positionSelect" style="width:100%" >
				<option></option>
			</select>
		</div>
		<input type="button" id="positionSetBtn" value="Save"></input>
      </div>
	  </div>
      <div class="col-md-6">
        <div class="field">
   	  </div>
   	</div>
   </div>
 </div>
</section>

<#if context.position??>
<h3>${relatedPositionName}s</h3>
<table>
	<tr>
		<th>Name</th>
		<th>Position</th>
		<th>Last Report</th>
		<th>Date of Last Report</th>
	</tr>
	<#list context.relatedPositions as related>
		<tr>
			<td><#if related.person??>${related.person.firstName} ${related.person.lastName}</#if></td>
			<td>${related.name} (${related.code!})</td>
			<td>last report intent here</td>
			<td>last report date here</td>
		</tr>
	</#list>
</table>

<h3>Previous Position Holders</h3>
<table>
	<tr>
		<th>Person</th>
		<th>Date</th>
	</tr>
	<#list context.previousHolders as person>
		<tr>
			<td>${person.firstName} ${person.lastName}</td>
			<td>Date person rotated out</td>
		</tr>
	</#list>
</table>

<h3>Reports by this Position</h3>
<table>
	<tr>
		<th>Who</th>
		<th>Topic</th>
	</tr>
	<#list context.positionReports as report>
		<tr>
			<td>${report.primaryAttendee!}</td>
			<td><a href="/reports/${report.id}">${report.intent!"no summary"}</a></td>
		</tr>
	</#list>
</table>
<#else>
<h3>Reports by this Person</h3>
</#if>
<script type="text/javascript">
$(document).ready(function() {
	$.ajax({
		url: "/positions/empty?type=${role}",
		method: "GET"
	}).done(function(response) {
		var results = $.map(response, function(el) {
			return {
				id: el["id"],
				text: el["name"]
			}
		});
		$("#positionSelect").select2( {
			dropdownParent: $(".mainbody"),
			data: results,
			placeholder: "Select a position",
			allowClear: true
		});

	});

	$("#positionSetBtn").on('click', function(event) {
		var positionId = $("#positionSelect").val();
		$.ajax({ url: '/positions/' + positionId + '/person',
			method: "POST",
			contentType: 'application/json',
			data: JSON.stringify({ id: ${id} })
		}).done(function (response) {
			location.reload();
		})
	});
});
</script>

</@application.layout>