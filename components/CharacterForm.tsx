import React from 'react';
import { MohoCharacterAttributes } from '../types';
import { Input } from './Input';
import { Button } from './Button';

interface CharacterFormProps {
  attributes: MohoCharacterAttributes;
  onChange: (attrs: MohoCharacterAttributes) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

export const CharacterForm: React.FC<CharacterFormProps> = ({
  attributes,
  onChange,
  onSubmit,
  isLoading
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    onChange({ ...attributes, [name]: value });
  };

  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
        <i className="fas fa-user-pen text-blue-500"></i>
        Character Design
      </h2>

      <Input
        label="Role / Character Type"
        name="role"
        value={attributes.role}
        onChange={handleChange}
        placeholder="e.g. Cyberpunk detective, Fantasy mage"
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Age"
          name="age"
          value={attributes.age}
          onChange={handleChange}
          placeholder="e.g. Young adult"
        />
        <Input
          label="Gender"
          name="gender"
          value={attributes.gender}
          onChange={handleChange}
          placeholder="e.g. Female"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Skin Tone"
          name="skinTone"
          value={attributes.skinTone}
          onChange={handleChange}
          placeholder="e.g. Light, tan, dark"
        />
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">
            Body Type
          </label>
          <select
            name="bodyType"
            value={attributes.bodyType}
            onChange={handleChange}
            className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
          >
            <option value="slim">Slim</option>
            <option value="average">Average</option>
            <option value="athletic">Athletic</option>
            <option value="heavy">Heavy</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Hair Color"
          name="hairColor"
          value={attributes.hairColor}
          onChange={handleChange}
          placeholder="e.g. Black, blonde, blue"
        />
        <Input
          label="Hair Style"
          name="hairStyle"
          value={attributes.hairStyle}
          onChange={handleChange}
          placeholder="e.g. Long ponytail, short spiky"
        />
      </div>

      <Input
        label="Clothing & Outfit"
        name="clothing"
        isTextArea
        value={attributes.clothing}
        onChange={handleChange}
        placeholder="Describe the outfit in detail..."
      />

      <Input
        label="Accessories"
        name="accessories"
        value={attributes.accessories}
        onChange={handleChange}
        placeholder="e.g. Glasses, hat, weapon"
      />

      <Input
        label="Art Style"
        name="artStyle"
        value={attributes.artStyle}
        onChange={handleChange}
        placeholder="e.g. Clean anime style, cartoon"
      />

      <div className="mt-4 pt-4 border-t border-slate-800">
        <Button
          className="w-full"
          onClick={onSubmit}
          isLoading={isLoading}
        >
          <i className="fas fa-wand-magic-sparkles"></i>
          Generate Animation Assets
        </Button>
        <p className="text-xs text-slate-500 mt-3 text-center">
          This will generate 24 individual body part images (6 parts x 4 views)
        </p>
      </div>
    </div>
  );
};
