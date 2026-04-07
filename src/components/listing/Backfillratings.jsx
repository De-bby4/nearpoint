// backfillRatings.js
// Run this ONCE to backfill ratings on all business docs
// Place this file anywhere in your src folder, import and call backfillRatings() once
// then remove the call (or delete the file entirely)

import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "../../firebase";

export const backfillRatings = async () => {
  console.log("Starting backfill...");

  // fetch all reviews
  const reviewsSnap = await getDocs(collection(db, "reviews"));
  const reviews = reviewsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

  // group reviews by businessId
  const reviewsByBiz = {};
  reviews.forEach((r) => {
    if (!reviewsByBiz[r.businessId]) reviewsByBiz[r.businessId] = [];
    reviewsByBiz[r.businessId].push(r);
  });

  // fetch all businesses
  const bizSnap = await getDocs(collection(db, "businesses"));

  let updated = 0;
  for (const bizDoc of bizSnap.docs) {
    const bizReviews = reviewsByBiz[bizDoc.id] || [];
    const avg = bizReviews.length > 0
      ? parseFloat(
          (bizReviews.reduce((sum, r) => sum + r.rating, 0) / bizReviews.length).toFixed(1)
        )
      : 0;

    await updateDoc(doc(db, "businesses", bizDoc.id), { rating: avg });
    console.log(`Updated ${bizDoc.data().name}: ${avg}`);
    updated++;
  }

  console.log(`Done! Updated ${updated} businesses.`);
};