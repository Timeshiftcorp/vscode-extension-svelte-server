<script content="module">
  import Repl, { set, toJson } from "@sveltejs/svelte-repl/src/Repl.svelte";
  import { onMount, getContext } from "svelte";
  let repl;
  let self = this;
  onMount(() => {
    console.log("mount");
    if (repl) {
      repl.set({ components: [{ name: "App", type: "svelte" }] });
    }
    const {
      bundle,
      selected,
      handle_change,
      navigate,
      register_module_editor
    } = getContext("REPL");

    setTimeout(() => {
      alert("urraa");
      let event = { detail: { value: "<h1> test </h1> " } };
      handle_change(event);
    }, 2000);
  });
</script>

<div style="height:800px">
  <Repl
    bind:this={repl}
    style="height:500px"
    workersUrl="http://localhost:8089" />
</div>
