<script context="module">
	export const prerender = true;
</script>

<script>
	import SignupBox from "../lib/SignupBox.svelte";
	import LinkToMainSite from "../lib/LinkToMainSite.svelte";
</script>

<svelte:head>
	<title>Audioxide Archive</title>
</svelte:head>

<section>

	<SignupBox />

	<LinkToMainSite />

</section>

<style>
	section {
		display: flex;
		flex-direction: column;
		justify-content: center;
		flex: 1;
	}

	h1 {
		width: 100%;
	}

</style>
