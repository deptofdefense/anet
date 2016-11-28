<#import "application/layout.ftl" as application>
<@application.layout>

<#if context.reports??>
<#list context.reports as report>
<section class="anet-block">
  <div class="anet-block__title">
    ${report.createdAt} - ${report.author.name} with Principal Name
    <div class="pull-right">
    	Approval Status
    </div>
  </div>

  <div class="anet-block__body">
    <div class="row">
      <div class="col-md-6">
       <div class="field">
       	<div class="header">Status:</div>
       	<div class="content">${report.state}</div>
	   </div>
	  </div>
      <div class="col-md-6">
        <div class="field">
        ${report.reportText}
        </div>
        <div class="field">
        <small>
        Created at: ${report.createdAt} <br>Updated at: ${report.updatedAt}
        </small>
        </div>
      </div>
 	</div>
 	<div class="row">
 	<a class="pull-right" href="/reports/${report.id}/">View</a>
 	</div>
</section>
</#list>
</#if>

<#if context.people??>
<section class="anet-block">
	<div class="anet-block__title">Person</div>
	<div class="anet-block__body">
		<ul>
		<#list context.people as person>
			<li>
				<a href="/people/${person.id}">${person.name}</a> - ${person.rank} - <#if person.position??>${person.position.name}</#if>
			</li>
		</#list>
		</ul>
	</di>
</section>
</#if>

<#if context.positions??>
<section class="anet-block">
	<div class="anet-block__title">Position</div>
	<div class="anet-block__body">
		<ul>
		<#list context.positions as position>
			<li>
				<a href="/positions/${position.id}">${position.name}</a> 
			</li>
		</#list>
	</div>
</section>
</#if>

<#if context.poams??>
<section class="anet-block">
	<div class="anet-block__title">Poam</div>
	<div class="anet-block__body">
		<ul>
		<#list context.poams as poam>
			<li>
				<a href="/poams/${poam.id}">${poam.shortName}</a> - ${poam.longName}
				
		</#list>
		</ul>
	</div>
</section>
</#if>

<#if context.locations??>
<section class="anet-block">
	<div class="anet-block__title">Location</div>
	<div class="anet-block__body">
	<ul>
		<#list context.locations as location>
			<li>
				<a href="/locations/${location.id}">${location.name}</a>
			</li>
		</#list>
	</ul>
	</div>
</section>
</#if>
<script type="text/javascript">
$(document).ready(function() {

	
})
</script>

</@application.layout>
