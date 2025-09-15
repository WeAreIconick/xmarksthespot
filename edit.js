/**
 * Retrieves the translation of text.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/packages/packages-i18n/
 */
import { __ } from '@wordpress/i18n';

/**
 * React hook that is used to mark the block wrapper element.
 * It provides all the necessary props like the class name.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/packages/packages-block-editor/#useblockprops
 */
import { 
	useBlockProps,
	MediaUpload,
	MediaUploadCheck,
	InspectorControls
} from '@wordpress/block-editor';

import {
	PanelBody,
	Button,
	SelectControl,
	ColorPicker,
	RangeControl,
	ToggleControl,
	Modal,
	TextControl,
	BaseControl,
	Flex,
	FlexItem,
	TextareaControl,
	__experimentalSpacer as Spacer,
	ExternalLink
} from '@wordpress/components';

import { useState, useRef } from '@wordpress/element';
import { plus, edit, trash } from '@wordpress/icons';

/**
 * Lets webpack process CSS, SASS or SCSS files referenced in JavaScript files.
 * Those files can contain any CSS code that gets applied to the editor.
 *
 * @see https://www.npmjs.com/package/@wordpress/scripts#using-css
 */
import './editor.scss';

/**
 * The edit function describes the structure of your block in the context of the
 * editor. This represents what the editor will render when the block is used.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-edit-save/#edit
 *
 * @return {Element} Element to render.
 */
export default function Edit({ attributes, setAttributes }) {
	const {
		imageId,
		imageUrl,
		imageAlt,
		hotspots,
		hotspotStyle,
		hotspotColor,
		hotspotSize,
		animation
	} = attributes;

	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editingHotspot, setEditingHotspot] = useState(null);
	const [tempHotspot, setTempHotspot] = useState({});
	const imageRef = useRef();

	const onSelectImage = (media) => {
		setAttributes({
			imageId: media.id,
			imageUrl: media.url,
			imageAlt: media.alt,
		});
	};

	const onImageClick = (event) => {
		if (!imageUrl) return;

		const rect = event.target.getBoundingClientRect();
		const x = ((event.clientX - rect.left) / rect.width) * 100;
		const y = ((event.clientY - rect.top) / rect.height) * 100;

		const newHotspot = {
			id: Date.now(),
			x: Math.round(x * 100) / 100,
			y: Math.round(y * 100) / 100,
			title: '',
			content: '',
			type: 'tooltip'
		};

		setTempHotspot(newHotspot);
		setEditingHotspot(newHotspot.id);
		setIsModalOpen(true);
	};

	const onEditHotspot = (hotspot) => {
		setTempHotspot({ ...hotspot });
		setEditingHotspot(hotspot.id);
		setIsModalOpen(true);
	};

	const onSaveHotspot = () => {
		const updatedHotspots = editingHotspot && hotspots.find(h => h.id === editingHotspot)
			? hotspots.map(h => h.id === editingHotspot ? tempHotspot : h)
			: [...hotspots, tempHotspot];

		setAttributes({ hotspots: updatedHotspots });
		setIsModalOpen(false);
		setEditingHotspot(null);
		setTempHotspot({});
	};

	const onDeleteHotspot = (id) => {
		setAttributes({
			hotspots: hotspots.filter(h => h.id !== id)
		});
	};

	const onDragHotspot = (id, event) => {
		if (!imageRef.current) return;

		const rect = imageRef.current.getBoundingClientRect();
		const x = ((event.clientX - rect.left) / rect.width) * 100;
		const y = ((event.clientY - rect.top) / rect.height) * 100;

		const updatedHotspots = hotspots.map(hotspot =>
			hotspot.id === id
				? { ...hotspot, x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) }
				: hotspot
		);

		setAttributes({ hotspots: updatedHotspots });
	};

	const renderHotspot = (hotspot) => {
		const hotspotStyles = {
			position: 'absolute',
			left: `${hotspot.x}%`,
			top: `${hotspot.y}%`,
			width: `${hotspotSize}px`,
			height: `${hotspotSize}px`,
			backgroundColor: hotspotColor,
			border: '2px solid white',
			borderRadius: hotspotStyle === 'circle' ? '50%' : hotspotStyle === 'square' ? '0' : '50%',
			cursor: 'pointer',
			transform: 'translate(-50%, -50%)',
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
			color: 'white',
			fontSize: '12px',
			fontWeight: 'bold',
			boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
			zIndex: 10
		};

		if (animation && hotspotStyle === 'pulse-dot') {
			hotspotStyles.animation = 'hotspot-pulse 2s infinite';
		}

		return (
			<div
				key={hotspot.id}
				style={hotspotStyles}
				onClick={(e) => {
					e.stopPropagation();
					onEditHotspot(hotspot);
				}}
				onMouseDown={(e) => {
					e.preventDefault();
					const handleMouseMove = (event) => {
						onDragHotspot(hotspot.id, event);
					};
					const handleMouseUp = () => {
						document.removeEventListener('mousemove', handleMouseMove);
						document.removeEventListener('mouseup', handleMouseUp);
					};
					document.addEventListener('mousemove', handleMouseMove);
					document.addEventListener('mouseup', handleMouseUp);
				}}
				title={__('Click to edit, drag to move', 'x-marks-the-spot-block-wp')}
			>
				{hotspotStyle === 'plus' && '+'}
				{hotspotStyle === 'numbered' && hotspots.indexOf(hotspot) + 1}
				{(hotspotStyle === 'pulse-dot' || hotspotStyle === 'circle') && ''}
			</div>
		);
	};

	return (
		<>
			<InspectorControls>
				<PanelBody title={__('Image Settings', 'x-marks-the-spot-block-wp')}>
					<MediaUploadCheck>
						<MediaUpload
							onSelect={onSelectImage}
							allowedTypes={['image']}
							value={imageId}
							render={({ open }) => (
								<Button onClick={open} variant="primary" style={{ marginBottom: '16px' }}>
									{imageUrl ? __('Replace Image', 'x-marks-the-spot-block-wp') : __('Select Image', 'x-marks-the-spot-block-wp')}
								</Button>
							)}
						/>
					</MediaUploadCheck>
					{imageUrl && (
						<TextControl
							label={__('Alt Text', 'x-marks-the-spot-block-wp')}
							value={imageAlt || ''}
							placeholder={__('Describe the image for screen readers', 'x-marks-the-spot-block-wp')}
							onChange={(value) => setAttributes({ imageAlt: value })}
						/>
					)}
				</PanelBody>

				<PanelBody title={__('Hotspot Appearance', 'x-marks-the-spot-block-wp')}>
					<SelectControl
						label={__('Hotspot Style', 'x-marks-the-spot-block-wp')}
						value={hotspotStyle}
						options={[
							{ label: __('Pulsing Dot', 'x-marks-the-spot-block-wp'), value: 'pulse-dot' },
							{ label: __('Plus Sign', 'x-marks-the-spot-block-wp'), value: 'plus' },
							{ label: __('Circle', 'x-marks-the-spot-block-wp'), value: 'circle' },
							{ label: __('Numbered', 'x-marks-the-spot-block-wp'), value: 'numbered' }
						]}
						onChange={(value) => setAttributes({ hotspotStyle: value })}
					/>

					<BaseControl label={__('Hotspot Color', 'x-marks-the-spot-block-wp')}>
						<ColorPicker
							color={hotspotColor}
							onChange={(value) => setAttributes({ hotspotColor: value })}
						/>
					</BaseControl>

					<RangeControl
						label={__('Hotspot Size', 'x-marks-the-spot-block-wp')}
						value={hotspotSize}
						onChange={(value) => setAttributes({ hotspotSize: value })}
						min={10}
						max={50}
					/>

					<ToggleControl
						label={__('Enable Animation', 'x-marks-the-spot-block-wp')}
						checked={animation}
						onChange={(value) => setAttributes({ animation: value })}
					/>
				</PanelBody>

				{hotspots.length > 0 && (
					<PanelBody title={__('Hotspot List', 'x-marks-the-spot-block-wp')}>
						{hotspots.map((hotspot, index) => (
							<Flex key={hotspot.id} justify="space-between" align="center">
								<FlexItem>
									<strong>{hotspot.title || __('Untitled Hotspot', 'x-marks-the-spot-block-wp')}</strong>
								</FlexItem>
								<FlexItem>
									<Button
										icon={edit}
										onClick={() => onEditHotspot(hotspot)}
										size="small"
										label={__('Edit Hotspot', 'x-marks-the-spot-block-wp')}
									/>
									<Button
										icon={trash}
										onClick={() => onDeleteHotspot(hotspot.id)}
										size="small"
										isDestructive
										label={__('Delete Hotspot', 'x-marks-the-spot-block-wp')}
									/>
								</FlexItem>
							</Flex>
						))}
					</PanelBody>
				)}

				<PanelBody title={__('Powered by Telex', 'x-marks-the-spot-block-wp')} initialOpen={false}>
					<p style={{ marginBottom: '12px' }}>
						{__('Telex is basically the J.A.R.V.I.S of WordPress development - an AI that builds blocks so you don\'t have to.', 'x-marks-the-spot-block-wp')}
					</p>
					<ExternalLink href="https://telex.automattic.ai">
						{__('Learn more about Telex', 'x-marks-the-spot-block-wp')}
					</ExternalLink>
				</PanelBody>
			</InspectorControls>

			<div {...useBlockProps()}>
				{!imageUrl ? (
					<div className="interactive-hotspots-placeholder">
						<MediaUploadCheck>
							<MediaUpload
								onSelect={onSelectImage}
								allowedTypes={['image']}
								value={imageId}
								render={({ open }) => (
									<Button onClick={open} variant="primary" icon={plus}>
										{__('Select Image for Hotspots', 'x-marks-the-spot-block-wp')}
									</Button>
								)}
							/>
						</MediaUploadCheck>
						<p>{__('Upload an image and click on it to add interactive hotspots.', 'x-marks-the-spot-block-wp')}</p>
					</div>
				) : (
					<div className="interactive-hotspots-container">
						<div 
							className="interactive-hotspots-image-wrapper"
							onClick={onImageClick}
							style={{ position: 'relative', display: 'inline-block', cursor: 'crosshair' }}
						>
							<img
								ref={imageRef}
								src={imageUrl}
								alt={imageAlt}
								style={{ maxWidth: '100%', height: 'auto', display: 'block' }}
							/>
							{hotspots.map(renderHotspot)}
						</div>
						{hotspots.length === 0 && (
							<p className="interactive-hotspots-help">
								{__('Click anywhere on the image to add a hotspot.', 'x-marks-the-spot-block-wp')}
							</p>
						)}
					</div>
				)}

				{isModalOpen && (
					<Modal
						title={editingHotspot && hotspots.find(h => h.id === editingHotspot) 
							? __('Edit Hotspot', 'x-marks-the-spot-block-wp')
							: __('Add New Hotspot', 'x-marks-the-spot-block-wp')
						}
						onRequestClose={() => setIsModalOpen(false)}
						size="medium"
						className="hotspot-edit-modal"
					>
						<div className="hotspot-modal-content" style={{ padding: '20px' }}>
							<TextControl
								label={__('Hotspot Title', 'x-marks-the-spot-block-wp')}
								value={tempHotspot.title || ''}
								placeholder={__('Enter a short title for this hotspot', 'x-marks-the-spot-block-wp')}
								onChange={(value) => setTempHotspot({ ...tempHotspot, title: value })}
								help={__('A short title for your hotspot', 'x-marks-the-spot-block-wp')}
							/>

							<TextareaControl
								label={__('Hotspot Content', 'x-marks-the-spot-block-wp')}
								value={tempHotspot.content || ''}
								onChange={(value) => setTempHotspot({ ...tempHotspot, content: value })}
								placeholder={__('Enter your hotspot content here. This will appear as a tooltip when users hover over the hotspot...', 'x-marks-the-spot-block-wp')}
								help={__('The content that will appear when users hover over this hotspot. Keep it concise for better tooltip display.', 'x-marks-the-spot-block-wp')}
								rows={6}
								style={{ width: '100%' }}
							/>

							<Spacer />

							<Flex justify="flex-end" gap="2">
								<Button 
									variant="secondary" 
									onClick={() => setIsModalOpen(false)}
								>
									{__('Cancel', 'x-marks-the-spot-block-wp')}
								</Button>
								<Button 
									variant="primary" 
									onClick={onSaveHotspot}
									disabled={!tempHotspot.title}
								>
									{__('Save Hotspot', 'x-marks-the-spot-block-wp')}
								</Button>
							</Flex>
						</div>
					</Modal>
				)}
			</div>
		</>
	);
}