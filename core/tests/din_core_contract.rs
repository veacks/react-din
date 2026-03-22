use din_core::{
    create_distortion_curve,
    fill_noise_samples,
    resolve_patch_asset_path,
    PATCH_DOCUMENT_VERSION,
    PATCH_INPUT_HANDLE_PREFIX,
};

#[test]
fn exposes_expected_patch_constants() {
    assert_eq!(PATCH_DOCUMENT_VERSION, 1);
    assert_eq!(PATCH_INPUT_HANDLE_PREFIX, "param:");
}

#[test]
fn distortion_curve_and_noise_helpers_return_samples() {
    let curve = create_distortion_curve("soft", 0.5, 64);
    let noise = fill_noise_samples("pink", 64);

    assert_eq!(curve.len(), 64);
    assert_eq!(noise.len(), 64);
}

#[test]
fn asset_root_prefixes_relative_patch_paths() {
    let resolved = resolve_patch_asset_path(
        Some("/samples/snare.wav".to_string()),
        Some("/public".to_string()),
    );

    assert_eq!(resolved.as_deref(), Some("/public/samples/snare.wav"));
}
