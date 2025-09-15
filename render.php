<?php
/**
 * @see https://github.com/WordPress/gutenberg/blob/trunk/docs/reference-guides/block-api/block-metadata.md#render
 */

$image_url = $attributes['imageUrl'] ?? '';
$image_alt = $attributes['imageAlt'] ?? '';
$hotspots = $attributes['hotspots'] ?? [];
$hotspot_style = $attributes['hotspotStyle'] ?? 'pulse-dot';
$hotspot_color = $attributes['hotspotColor'] ?? '#007cba';
$hotspot_size = $attributes['hotspotSize'] ?? 20;
$animation = $attributes['animation'] ?? true;

if (empty($image_url)) {
    return '';
}

$wrapper_attributes = get_block_wrapper_attributes();
?>

<div <?php echo $wrapper_attributes; ?>>
    <div class="interactive-hotspots-container">
        <div class="interactive-hotspots-image-wrapper">
            <img 
                src="<?php echo esc_url($image_url); ?>" 
                alt="<?php echo esc_attr($image_alt); ?>"
                style="max-width: 100%; height: auto; display: block;"
            />
            
            <?php if (!empty($hotspots)): ?>
                <?php foreach ($hotspots as $index => $hotspot): ?>
                    <?php
                    $hotspot_id = $hotspot['id'] ?? $index;
                    $x = $hotspot['x'] ?? 50;
                    $y = $hotspot['y'] ?? 50;
                    $title = $hotspot['title'] ?? '';
                    $content = $hotspot['content'] ?? '';
                    $type = 'tooltip'; // Always use tooltip now
                    $url = $hotspot['url'] ?? '';
                    $link_target = $hotspot['linkTarget'] ?? '_self';
                    
                    $hotspot_classes = ['hotspot', $hotspot_style];
                    if ($animation && $hotspot_style === 'pulse-dot') {
                        $hotspot_classes[] = 'animated';
                    }
                    
                    // Build styles manually with responsive sizing
                    $hotspot_styles = 'position: absolute;';
                    $hotspot_styles .= ' left: ' . esc_attr($x) . '%;';
                    $hotspot_styles .= ' top: ' . esc_attr($y) . '%;';
                    // Use clamp for responsive sizing - base size from settings but scales with viewport
                    $min_size = max(12, $hotspot_size * 0.6); // 60% of setting as minimum
                    $max_size = min(32, $hotspot_size * 1.2); // 120% of setting as maximum
                    $hotspot_styles .= ' width: clamp(' . $min_size . 'px, ' . ($hotspot_size * 0.15) . 'vw, ' . $hotspot_size . 'px);';
                    $hotspot_styles .= ' height: clamp(' . $min_size . 'px, ' . ($hotspot_size * 0.15) . 'vw, ' . $hotspot_size . 'px);';
                    $hotspot_styles .= ' background-color: ' . esc_attr($hotspot_color) . ';';
                    $hotspot_styles .= ' border: 2px solid white;';
                    $hotspot_styles .= ' transform: translate(-50%, -50%);';
                    $hotspot_styles .= ' display: flex;';
                    $hotspot_styles .= ' align-items: center;';
                    $hotspot_styles .= ' justify-content: center;';
                    $hotspot_styles .= ' color: white;';
                    $hotspot_styles .= ' font-size: clamp(8px, 2vw, 14px);';
                    $hotspot_styles .= ' font-weight: bold;';
                    $hotspot_styles .= ' box-shadow: 0 2px 8px rgba(0,0,0,0.3);';
                    $hotspot_styles .= ' z-index: 10;';
                    $hotspot_styles .= ' cursor: pointer;';
                    
                    if ($hotspot_style === 'circle' || $hotspot_style === 'pulse-dot') {
                        $hotspot_styles .= ' border-radius: 50%;';
                    }
                    ?>
                    
                    <div 
                        class="<?php echo esc_attr(implode(' ', $hotspot_classes)); ?>"
                        style="<?php echo $hotspot_styles; ?>"
                        data-id="<?php echo esc_attr($hotspot_id); ?>"
                        data-type="<?php echo esc_attr($type); ?>"
                        data-title="<?php echo esc_attr($title); ?>"
                        data-content="<?php echo esc_attr(wp_strip_all_tags($content)); ?>"
                        data-x="<?php echo esc_attr($x); ?>"
                        data-y="<?php echo esc_attr($y); ?>"
                        <?php if ($type === 'link' && $url): ?>
                            data-url="<?php echo esc_url($url); ?>"
                            data-link-target="<?php echo esc_attr($link_target); ?>"
                        <?php endif; ?>
                        aria-label="<?php echo esc_attr($title ?: __('Interactive hotspot', 'x-marks-the-spot-block-wp')); ?>"
                        role="button"
                        tabindex="0"
                    >
                        <?php if ($hotspot_style === 'plus'): ?>
                            +
                        <?php elseif ($hotspot_style === 'numbered'): ?>
                            <?php echo esc_html($index + 1); ?>
                        <?php endif; ?>
                    </div>
                <?php endforeach; ?>
            <?php endif; ?>
        </div>
    </div>
</div>