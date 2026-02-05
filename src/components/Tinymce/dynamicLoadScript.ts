let callbacks: ((error: Error | null, script?: HTMLScriptElement) => void)[] =
  [];

function loadedTinymce() {
  // to fixed https://github.com/PanJiaChen/vue-element-admin/issues/2144
  // check is successfully downloaded script
  return (window as any).tinymce;
}

const dynamicLoadScript = (
  src: string,
  callback?: (error: Error | null, script?: HTMLScriptElement) => void,
) => {
  const existingScript = document.getElementById(
    src,
  ) as HTMLScriptElement | null;
  const cb = callback || function () {};

  if (!existingScript) {
    const script = document.createElement("script");
    script.src = src; // src url for the third-party library being loaded.
    script.id = src;
    document.body.appendChild(script);
    callbacks.push(cb);
    const onEnd = "onload" in script ? stdOnEnd : ieOnEnd;
    onEnd(script);
  }

  if (existingScript && cb) {
    if (loadedTinymce()) {
      cb(null, existingScript);
    } else {
      callbacks.push(cb);
    }
  }

  function stdOnEnd(script: HTMLScriptElement) {
    script.onload = function () {
      // this.onload = null here is necessary
      // because even IE9 works not like others
      this.onerror = this.onload = null;
      for (const cb of callbacks) {
        cb(null, script);
      }
      callbacks = [];
    };
    script.onerror = function () {
      this.onerror = this.onload = null;
      cb(new Error("Failed to load " + src), script);
    };
  }

  function ieOnEnd(script: HTMLScriptElement) {
    (script as any).onreadystatechange = function () {
      if (
        (this as any).readyState !== "complete" &&
        (this as any).readyState !== "loaded"
      )
        return;

      (this as any).onreadystatechange = null;
      for (const cb of callbacks) {
        cb(null, script); // there is no way to catch loading errors in IE8
      }
      callbacks = [];
    };
  }
};

export default dynamicLoadScript;
