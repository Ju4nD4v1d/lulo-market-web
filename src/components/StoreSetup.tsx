// Update the handleSubmit function in StoreSetup.tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError(null);
  setSaveProgress('saving');
  setShowProgress(true);

  const startTime = Date.now();

  try {
    let storeImageUrl = storeImage.url;
    if (storeImage.file) {
      setSaveProgress('uploading');
      storeImageUrl = await uploadStoreImage();
    }

    const aboutSectionPromises = formData.aboutSections.map(async (section, index) => {
      if (section.image) {
        const imageUrl = await uploadAboutImage(section.image, index);
        return { ...section, imageUrl };
      }
      return section;
    });

    const updatedAboutSections = await Promise.all(aboutSectionPromises);

    setSaveProgress('finalizing');

    const geocoder = new google.maps.Geocoder();
    const geocodeResult = await geocoder.geocode({ address: formData.address });
    
    if (!geocodeResult.results[0]) {
      throw new Error('Invalid address. Please enter a valid address.');
    }

    const location = geocodeResult.results[0].geometry.location;
    const coordinates = {
      lat: location.lat(),
      lng: location.lng()
    };

    const storeData = {
      name: formData.name,
      description: formData.description,
      address: formData.address,
      location: new GeoPoint(coordinates.lat, coordinates.lng),
      phone: formData.phone,
      website: formData.website,
      storeBusinessHours: formData.storeBusinessHours,
      titleTabAboutFirst: updatedAboutSections[0]?.title || '',
      bodyTabAboutFirst: updatedAboutSections[0]?.description || '',
      imageTabAboutFirst: updatedAboutSections[0]?.imageUrl || updatedAboutSections[0]?.imagePreview || '',
      titleTabAboutSecond: updatedAboutSections[1]?.title || '',
      bodyTabAboutSecond: updatedAboutSections[1]?.description || '',
      imageTabAboutSecond: updatedAboutSections[1]?.imageUrl || updatedAboutSections[1]?.imagePreview || '',
      titleTabAboutThird: updatedAboutSections[2]?.title || '',
      bodyTabAboutThird: updatedAboutSections[2]?.description || '',
      imageTabAboutThird: updatedAboutSections[2]?.imageUrl || updatedAboutSections[2]?.imagePreview || '',
      ownerId: currentUser.uid,
      createdAt: new Date(),
      storeImage: storeImageUrl
    };

    const storesRef = collection(db, 'stores');
    const q = query(storesRef, where('ownerId', '==', currentUser.uid));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      await addDoc(collection(db, 'stores'), storeData);
    } else {
      const storeDoc = querySnapshot.docs[0].ref;
      await updateDoc(storeDoc, storeData);
    }

    const elapsedTime = Date.now() - startTime;
    if (elapsedTime < 3000) {
      await new Promise(resolve => setTimeout(resolve, 3000 - elapsedTime));
    }

    setSaveProgress('complete');

  } catch (error) {
    console.error('Error saving store:', error);
    setError(error instanceof Error ? error.message : 'Failed to save store information');
    setShowProgress(false);
  }
};