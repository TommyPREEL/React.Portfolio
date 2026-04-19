/**
 * Detects whether the browser is using hardware (GPU) acceleration for WebGL.
 * Creates a temporary off-screen WebGL context, reads the renderer string via
 * the WEBGL_debug_renderer_info extension, and checks for known software
 * rasterizer names (SwiftShader, llvmpipe, Mesa, etc.).
 *
 * @returns true  — GPU hardware acceleration is active
 * @returns false — software renderer detected (or WebGL unavailable)
 */
export function isHWAccelEnabled(): boolean {
  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl") ??
      canvas.getContext("experimental-webgl") as WebGLRenderingContext | null;

    if (!gl) return false;

    const ext = gl.getExtension("WEBGL_debug_renderer_info");
    if (!ext) {
      // Extension unavailable — assume OK (privacy-protected browsers hide it)
      return true;
    }

    const renderer = (
      gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) as string
    ).toLowerCase();

    const softwareKeywords = [
      "swiftshader",
      "software",
      "llvmpipe",
      "mesa",
      "microsoft basic render",
      "angle (software",
      "vmware",
      "virtualbox",
    ];

    return !softwareKeywords.some((kw) => renderer.includes(kw));
  } catch {
    return true; // Don't block the user if detection fails
  }
}
