<div class="logo">
	<a href="/"><img alt="ANET" src="/assets/img/anet.png"></a>
</div>
<div class="navigation">
	<ul class="usa-sidenav-list">
		<li><a <#if context.url == "">class="usa-current"</#if> href="/">Home</a></li>
		<li>
			<a <#if context.url == "reports/new">class="usa-current"</#if> href="/reports/new">Submit a Report</a>
			<ul class="usa-sidenav-sub_list">
				<li><a href="#">Your Details</a></li>
			</ul>
		</li>
		<li><a <#if context.url == "reports/">class="usa-current"</#if> href="/reports/">Your Reports &amp; Approvals</a></li>
		<!-- <li><a href="/">Analytics</a></li> -->
		<li>
			<a href="#">Advisor Organizations</a>
			<ul class="usa-sidenav-sub_list collapsed">
				<#list context.topAdvisorOrgs as ao>
				<li><a href="/organizations/${ao.id}">${ao.name}</a></li>
				<#else>
				<li>No AOs in Db</li>
				</#list>
			</ul>
		</li>
		<!-- <li><a data-toggle="tooltip" title="Coming soon!" href="/">ANET Training</a></li> -->
		<#-- <li><a href="/assets/anet-roadmap.jpg">ANETRoadmap</a></li> -->
	</ul>
</div>
