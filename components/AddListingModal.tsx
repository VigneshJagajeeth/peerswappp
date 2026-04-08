import React, { useState } from 'react';
import { Listing, ListingType, PaymentType } from '../types';

interface AddListingModalProps {
  onAdd: (listingData: Omit<Listing, 'id' | 'userId' | 'userName' | 'userAvatarUrl' | 'imageUrl' | 'createdAt'>) => void;
  onClose: () => void;
}

const AddListingModal: React.FC<AddListingModalProps> = ({ onAdd, onClose }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [tradePreferences, setTradePreferences] = useState('');
  const [listingType, setListingType] = useState<ListingType>(ListingType.SALE);
  const [paymentType, setPaymentType] = useState<PaymentType>(PaymentType.POINTS);
  const [pointsPrice, setPointsPrice] = useState('');
  const [pointsPriceDuration, setPointsPriceDuration] = useState<'hour' | 'day' | 'week' | 'month' | 'flat'>('day');
  const [skillPrice, setSkillPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) {
        alert("Please fill in all required fields.");
        return;
    }
    
    const data: any = {
      title,
      description,
      category,
      location,
      tradePreferences,
      listingType,
      paymentType,
    };

    if (imageUrl) {
      data.imageUrl = imageUrl;
    }

    if (paymentType === PaymentType.POINTS || paymentType === PaymentType.BOTH) {
      data.pointsPrice = parseFloat(pointsPrice);
      if (listingType === ListingType.RENTAL) {
        data.pointsPriceDuration = pointsPriceDuration;
      }
    }
    if (paymentType === PaymentType.SKILL || paymentType === PaymentType.BOTH) {
      data.skillPrice = skillPrice;
    }
    if (listingType === ListingType.SKILL) {
      data.isVerified = false;
    }

    onAdd(data);
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center"
      aria-modal="true"
      role="dialog"
    >
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-lg w-full m-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Add a New Listing</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary"
              required
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
              required
            />
          </div>
          <div>
            <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Image URL (Optional)</label>
            <input
              type="url"
              id="imageUrl"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="e.g., https://example.com/image.jpg"
              className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
              <input
                type="text"
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g., Electronics, Tutoring"
                className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Location</label>
              <input
                type="text"
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., New York, NY"
                className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
          <div>
            <label htmlFor="listingType" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Listing Type</label>
            <select
              id="listingType"
              value={listingType}
              onChange={(e) => setListingType(e.target.value as ListingType)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary"
            >
              <option value={ListingType.SALE}>For Sale</option>
              <option value={ListingType.RENTAL}>For Rent</option>
              <option value={ListingType.SKILL}>Skill Exchange</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Payment Option</label>
            <div className="mt-2 space-y-2">
                <div className="flex items-center">
                    <input id="pay-cash" type="radio" value={PaymentType.POINTS} checked={paymentType === PaymentType.POINTS} onChange={(e) => setPaymentType(e.target.value as PaymentType)} className="focus:ring-primary h-4 w-4 text-primary border-gray-300" />
                    <label htmlFor="pay-cash" className="ml-3 block text-sm font-medium text-gray-700">Points Only</label>
                </div>
                <div className="flex items-center">
                    <input id="pay-skill" type="radio" value={PaymentType.SKILL} checked={paymentType === PaymentType.SKILL} onChange={(e) => setPaymentType(e.target.value as PaymentType)} className="focus:ring-primary h-4 w-4 text-primary border-gray-300" />
                    <label htmlFor="pay-skill" className="ml-3 block text-sm font-medium text-gray-700">Skill Swap Only</label>
                </div>
                <div className="flex items-center">
                    <input id="pay-both" type="radio" value={PaymentType.BOTH} checked={paymentType === PaymentType.BOTH} onChange={(e) => setPaymentType(e.target.value as PaymentType)} className="focus:ring-primary h-4 w-4 text-primary border-gray-300" />
                    <label htmlFor="pay-both" className="ml-3 block text-sm font-medium text-gray-700">Points or Skill Swap</label>
                </div>
            </div>
          </div>
          
          {(paymentType === PaymentType.POINTS || paymentType === PaymentType.BOTH) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="pointsPrice" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Points Price</label>
                <input
                  type="number"
                  id="pointsPrice"
                  value={pointsPrice}
                  onChange={(e) => setPointsPrice(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                  placeholder="e.g., 50"
                  min="0"
                  step="1"
                  required
                />
              </div>
              {listingType === ListingType.RENTAL && (
                <div>
                  <label htmlFor="pointsPriceDuration" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Duration</label>
                  <select
                    id="pointsPriceDuration"
                    value={pointsPriceDuration}
                    onChange={(e) => setPointsPriceDuration(e.target.value as any)}
                    className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                  >
                    <option value="hour">Per Hour</option>
                    <option value="day">Per Day</option>
                    <option value="week">Per Week</option>
                    <option value="month">Per Month</option>
                    <option value="flat">Flat Rate</option>
                  </select>
                </div>
              )}
            </div>
          )}

          {(paymentType === PaymentType.SKILL || paymentType === PaymentType.BOTH) && (
            <div className="space-y-4">
              <div>
                <label htmlFor="skillPrice" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Desired Skill Swap</label>
                <input
                  type="text"
                  id="skillPrice"
                  value={skillPrice}
                  onChange={(e) => setSkillPrice(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                  placeholder="e.g., Help with a resume"
                  required
                />
              </div>
              <div>
                <label htmlFor="tradePreferences" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Other Trade Preferences (Optional)</label>
                <input
                  type="text"
                  id="tradePreferences"
                  value={tradePreferences}
                  onChange={(e) => setTradePreferences(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                  placeholder="e.g., Will accept old video games"
                />
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-200 text-gray-800 font-semibold px-6 py-2 rounded-md hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-primary text-white font-semibold px-6 py-2 rounded-md shadow-md hover:bg-primary/90 transition-colors"
            >
              Add Listing
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddListingModal;
