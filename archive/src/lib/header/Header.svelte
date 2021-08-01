<script>
</script>

	<header>
		<span class="header-text">Receive Audioxide roundups every month → <a href="https://eepurl.com/cox6qr" class="signup-link">Sign up here</a></span>
		<div class="dropdown">
			<button class="dropbtn">Browse Archive
				<i class="fa fa-caret-down"></i>
			</button>
			<div class="dropdown-content">
				<a href="#">July 02021</a>
				<a href="#">June 02021</a>
				<a href="#">May 02021</a>
			</div>
		</div>

	</header>

	<!-- <nav>
		<ul>
			<li class:active={$page.path === '/'}><a sveltekit:prefetch href="/">Home</a></li>
			<li class:active={$page.path === '/about'}><a sveltekit:prefetch href="/about">About</a></li>
			<li class:active={$page.path === '/todos'}><a sveltekit:prefetch href="/todos">Todos</a></li>
		</ul>
		<svg viewBox="0 0 2 3" aria-hidden="true">
			<path d="M0,0 L0,3 C0.5,3 0.5,3 1,2 L2,0 Z" />
		</svg>
	</nav> -->

<style>
	header {
		display: flex;
		justify-content: space-between;
		position: fixed;
        top: 0;
		width: 100%;
	}

	.corner a {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 100%;
	}

	nav {
		display: flex;
		justify-content: center;
		--background: rgba(255, 255, 255, 0.7);
	}

	path {
		fill: var(--background);
	}

	ul {
		position: relative;
		padding: 0;
		margin: 0;
		height: 3em;
		display: flex;
		justify-content: center;
		align-items: center;
		list-style: none;
		background: var(--background);
		background-size: contain;
	}

	li {
		position: relative;
		height: 100%;
	}

	li.active::before {
		--size: 6px;
		content: '';
		width: 0;
		height: 0;
		position: absolute;
		top: 0;
		left: calc(50% - var(--size));
		border: var(--size) solid transparent;
		border-top: var(--size) solid var(--accent-color);
	}

	nav a {
		display: flex;
		height: 100%;
		align-items: center;
		padding: 0 1em;
		color: var(--heading-color);
		font-weight: 700;
		font-size: 0.8rem;
		text-transform: uppercase;
		text-decoration: none;
		transition: color 0.2s linear;
	}

	a:hover {
		color: var(--accent-color);
	}

	/* Navbar container */
	header {
		overflow: hidden;
		background-color: #282828;
		font-family: Arial, sans-serif;
	}

	/* Links inside the navbar */
	header a {
		font-size: 16px;
		color: white;
		text-align: center;
		padding: 14px 16px;
		text-decoration: none;
	}

	.header-text {
		float: left;
		display: block;
		color: white;
		padding: 14px 16px;
	}

	.signup-link {
		text-decoration: underline;
	}

	/* The dropdown container */
	.dropdown {
		float: right;
		overflow: hidden;
	}

	/* Dropdown button */
	.dropdown .dropbtn {
		font-size: 16px;
		border: none;
		outline: none;
		color: white;
		padding: 14px 16px;
		background-color: inherit;
		font-family: inherit; /* Important for vertical align on mobile phones */
		margin: 0; /* Important for vertical align on mobile phones */
	}

	/* Add a red background color to navbar links on hover */
	.navbar a:hover, .dropdown:hover .dropbtn {
		background-color: lightgray;
	}

	/* Dropdown content (hidden by default) */
	.dropdown-content {
		display: none;
		position: absolute;
		background-color: #f9f9f9;
		box-shadow: 0 8px 16px 0 rgba(0,0,0,0.2);
		z-index: 1;
	}

	/* Links inside the dropdown */
	.dropdown-content a {
		float: none;
		color: black;
		padding: 12px 16px;
		text-decoration: none;
		display: block;
		text-align: left;
	}

	/* Add a grey background color to dropdown links on hover */
	.dropdown-content a:hover {
		background-color: #ddd;
	}

	/* Show the dropdown menu on hover */
	.dropdown:hover .dropdown-content {
		display: block;
	}

</style>
