/**
 * Interactive functionality for X Marks the Spot block
 * Handles tooltips and responsive behavior - optimized for touch screens
 */

document.addEventListener('DOMContentLoaded', function() {
	const hotspotBlocks = document.querySelectorAll('.wp-block-telex-block-x-marks-the-spot');
	
	hotspotBlocks.forEach(initializeHotspotsBlock);
	
	function initializeHotspotsBlock(block) {
		const imageWrapper = block.querySelector('.interactive-hotspots-image-wrapper');
		const image = block.querySelector('img');
		const hotspots = block.querySelectorAll('.hotspot');
		let currentTooltip = null;
		let originalImageSize = null;
		let tooltipTimeout = null;
		let touchStartTime = 0;
		let touchMoved = false;
		let isTouch = false;
		
		// Detect touch device
		const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
		
		// Store original image dimensions once loaded
		if (image.complete) {
			storeOriginalSize();
			updateHotspotPositions();
		} else {
			image.addEventListener('load', function() {
				storeOriginalSize();
				updateHotspotPositions();
			});
		}
		
		function storeOriginalSize() {
			if (!originalImageSize) {
				originalImageSize = {
					width: image.naturalWidth,
					height: image.naturalHeight,
					aspectRatio: image.naturalWidth / image.naturalHeight
				};
			}
		}
		
		function updateHotspotPositions() {
			if (!originalImageSize || !image) return;
			
			const currentImageRect = image.getBoundingClientRect();
			const currentImageWidth = currentImageRect.width;
			const currentImageHeight = currentImageRect.height;
			const currentAspectRatio = currentImageWidth / currentImageHeight;
			
			// Calculate actual displayed image dimensions
			let displayedWidth, displayedHeight;
			let offsetX = 0, offsetY = 0;
			
			if (currentAspectRatio > originalImageSize.aspectRatio) {
				// Image is wider than natural - constrained by height
				displayedHeight = currentImageHeight;
				displayedWidth = displayedHeight * originalImageSize.aspectRatio;
				offsetX = (currentImageWidth - displayedWidth) / 2;
			} else {
				// Image is taller than natural - constrained by width  
				displayedWidth = currentImageWidth;
				displayedHeight = displayedWidth / originalImageSize.aspectRatio;
				offsetY = (currentImageHeight - displayedHeight) / 2;
			}
			
			// Update each hotspot position
			hotspots.forEach(hotspot => {
				const xPercent = parseFloat(hotspot.dataset.x || '50');
				const yPercent = parseFloat(hotspot.dataset.y || '50');
				
				// Calculate position relative to actual displayed image
				const xPos = offsetX + (displayedWidth * xPercent / 100);
				const yPos = offsetY + (displayedHeight * yPercent / 100);
				
				// Convert to percentage of container
				const leftPercent = (xPos / currentImageWidth) * 100;
				const topPercent = (yPos / currentImageHeight) * 100;
				
				hotspot.style.left = leftPercent + '%';
				hotspot.style.top = topPercent + '%';
			});
		}
		
		// Set up event listeners optimized for both touch and mouse
		hotspots.forEach(hotspot => {
			// Touch events for mobile
			hotspot.addEventListener('touchstart', handleTouchStart, { passive: false });
			hotspot.addEventListener('touchmove', handleTouchMove, { passive: false });
			hotspot.addEventListener('touchend', handleTouchEnd, { passive: false });
			hotspot.addEventListener('touchcancel', handleTouchCancel, { passive: false });
			
			// Mouse events for desktop (only if not a touch device)
			if (!isTouchDevice) {
				hotspot.addEventListener('mouseenter', handleTooltipEnter);
				hotspot.addEventListener('mouseleave', handleTooltipLeave);
				hotspot.addEventListener('click', handleClick);
			}
			
			// Keyboard accessibility
			hotspot.addEventListener('keydown', function(e) {
				if (e.key === 'Enter' || e.key === ' ') {
					e.preventDefault();
					handleTooltipClick(e);
				}
			});
			
			// Make hotspots focusable for keyboard navigation
			hotspot.setAttribute('tabindex', '0');
		});
		
		// Handle window resize with debouncing
		let resizeTimeout;
		function handleResize() {
			clearTimeout(resizeTimeout);
			resizeTimeout = setTimeout(() => {
				updateHotspotPositions();
				hideTooltip(); // Hide tooltips on resize
			}, 100);
		}
		
		window.addEventListener('resize', handleResize);
		
		// Also handle orientation change on mobile
		window.addEventListener('orientationchange', function() {
			setTimeout(() => {
				updateHotspotPositions();
				hideTooltip();
			}, 200);
		});
		
		// Touch event handlers
		function handleTouchStart(e) {
			e.preventDefault(); // Prevent default touch behaviors
			isTouch = true;
			touchStartTime = Date.now();
			touchMoved = false;
			
			// Add visual feedback for touch
			const hotspot = e.currentTarget;
			hotspot.style.transform = hotspot.style.transform.replace('scale(1)', '') + ' scale(0.95)';
		}
		
		function handleTouchMove(e) {
			e.preventDefault();
			touchMoved = true;
			
			// Remove visual feedback if user is scrolling
			const hotspot = e.currentTarget;
			hotspot.style.transform = hotspot.style.transform.replace(' scale(0.95)', '');
		}
		
		function handleTouchEnd(e) {
			e.preventDefault();
			const touchDuration = Date.now() - touchStartTime;
			const hotspot = e.currentTarget;
			
			// Remove visual feedback
			hotspot.style.transform = hotspot.style.transform.replace(' scale(0.95)', '');
			
			// Only show tooltip if it was a quick tap without movement
			if (!touchMoved && touchDuration < 500) {
				handleTooltipClick(e);
			}
			
			isTouch = false;
		}
		
		function handleTouchCancel(e) {
			e.preventDefault();
			const hotspot = e.currentTarget;
			hotspot.style.transform = hotspot.style.transform.replace(' scale(0.95)', '');
			isTouch = false;
			touchMoved = true;
		}
		
		// Mouse event handlers (desktop only)
		function handleTooltipEnter(e) {
			if (isTouch) return; // Don't show on touch devices
			
			const hotspot = e.currentTarget;
			const content = hotspot.dataset.content || '';
			
			if (content) {
				showTooltip(hotspot, content);
			}
		}
		
		function handleTooltipLeave(e) {
			if (isTouch) return; // Don't hide on touch devices
			hideTooltip();
		}
		
		function handleClick(e) {
			if (isTouch) return; // Touch events handle this
			e.preventDefault();
			handleTooltipClick(e);
		}
		
		function handleTooltipClick(e) {
			if (e) {
				e.preventDefault();
				e.stopPropagation();
			}
			
			const hotspot = e.currentTarget;
			const content = hotspot.dataset.content || '';
			
			if (content) {
				// Toggle tooltip on touch devices
				if (currentTooltip && currentTooltip.dataset.hotspotId === hotspot.dataset.id) {
					hideTooltip();
					return;
				}
				
				showTooltip(hotspot, content);
				
				// Auto-hide tooltip after delay
				clearTimeout(tooltipTimeout);
				tooltipTimeout = setTimeout(() => {
					hideTooltip();
				}, isTouchDevice ? 4000 : 3000); // Longer on touch devices
			}
		}
		
		function showTooltip(hotspot, content) {
			hideTooltip();
			
			const tooltip = document.createElement('div');
			tooltip.className = 'hotspot-tooltip';
			tooltip.innerHTML = content;
			tooltip.dataset.hotspotId = hotspot.dataset.id;
			
			// Add touch-friendly styles for mobile
			if (isTouchDevice) {
				tooltip.style.fontSize = 'clamp(12px, 3vw, 14px)';
				tooltip.style.padding = '0.75rem';
				tooltip.style.maxWidth = 'clamp(150px, 50vw, 200px)';
				tooltip.style.lineHeight = '1.4';
			}
			
			document.body.appendChild(tooltip);
			currentTooltip = tooltip;
			
			// Position tooltip with better mobile positioning
			const hotspotRect = hotspot.getBoundingClientRect();
			const tooltipRect = tooltip.getBoundingClientRect();
			const viewportWidth = window.innerWidth;
			const viewportHeight = window.innerHeight;
			const scrollY = window.scrollY;
			const scrollX = window.scrollX;
			
			// Center horizontally relative to hotspot
			let left = hotspotRect.left + scrollX + (hotspotRect.width / 2) - (tooltipRect.width / 2);
			// Position above the hotspot with minimal spacing
			let top = hotspotRect.top + scrollY - tooltipRect.height - 5;
			
			// Horizontal boundary checks with more padding on mobile
			const horizontalPadding = isTouchDevice ? 15 : 10;
			if (left < horizontalPadding) {
				left = horizontalPadding;
			} else if (left + tooltipRect.width > viewportWidth - horizontalPadding) {
				left = viewportWidth - tooltipRect.width - horizontalPadding;
			}
			
			// Vertical positioning - prefer above, but use below if necessary
			const verticalPadding = isTouchDevice ? 20 : 10;
			if (top < scrollY + verticalPadding) {
				top = hotspotRect.bottom + scrollY + 5;
				tooltip.classList.add('below');
			}
			
			// Final boundary check for bottom
			if (top + tooltipRect.height > scrollY + viewportHeight - verticalPadding) {
				top = scrollY + viewportHeight - tooltipRect.height - verticalPadding;
			}
			
			tooltip.style.left = left + 'px';
			tooltip.style.top = top + 'px';
			
			// Add fade-in animation
			tooltip.style.opacity = '0';
			tooltip.style.transform = 'translateY(5px) scale(0.95)';
			tooltip.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
			
			setTimeout(() => {
				if (tooltip.parentNode) {
					tooltip.style.opacity = '1';
					tooltip.style.transform = 'translateY(0) scale(1)';
				}
			}, 10);
			
			// Add close button for touch devices
			if (isTouchDevice) {
				const closeButton = document.createElement('button');
				closeButton.innerHTML = '×';
				closeButton.className = 'tooltip-close';
				closeButton.style.cssText = `
					position: absolute;
					top: -5px;
					right: -5px;
					width: 20px;
					height: 20px;
					border-radius: 50%;
					border: none;
					background: rgba(255,255,255,0.9);
					color: #333;
					font-size: 14px;
					font-weight: bold;
					cursor: pointer;
					display: flex;
					align-items: center;
					justify-content: center;
					box-shadow: 0 1px 3px rgba(0,0,0,0.3);
				`;
				
				closeButton.addEventListener('click', function(e) {
					e.preventDefault();
					e.stopPropagation();
					hideTooltip();
				});
				
				tooltip.appendChild(closeButton);
			}
		}
		
		function hideTooltip() {
			clearTimeout(tooltipTimeout);
			if (currentTooltip) {
				currentTooltip.remove();
				currentTooltip = null;
			}
		}
		
		// Hide tooltip when touching/clicking elsewhere
		document.addEventListener('touchstart', function(e) {
			if (!e.target.closest('.hotspot') && !e.target.closest('.hotspot-tooltip')) {
				hideTooltip();
			}
		}, { passive: true });
		
		document.addEventListener('click', function(e) {
			if (!isTouchDevice && !e.target.closest('.hotspot') && !e.target.closest('.hotspot-tooltip')) {
				hideTooltip();
			}
		});
		
		// Hide tooltip on scroll
		window.addEventListener('scroll', hideTooltip, { passive: true });
	}
});