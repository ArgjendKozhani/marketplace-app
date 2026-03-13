const initialForm = {
  title: '',
  category: 'cars',
  price: '',
  location: '',
  condition: '',
  sellerType: 'Individual',
  description: ''
};

export default function SellForm({ categories, onSubmit, isSubmitting }) {
  return (
    <form
      className="sell-form"
      onSubmit={async (event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);

        const didPublish = await onSubmit({
          title: formData.get('title'),
          category: formData.get('category'),
          price: formData.get('price'),
          location: formData.get('location'),
          condition: formData.get('condition'),
          sellerType: formData.get('sellerType'),
          description: formData.get('description')
        });

        if (didPublish) {
          event.currentTarget.reset();
        }
      }}
    >
      <div className="form-grid">
        <label>
          Title
          <input name="title" placeholder="BMW X3 2018" defaultValue={initialForm.title} required />
        </label>

        <label>
          Category
          <select name="category" defaultValue={initialForm.category}>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          Price
          <input name="price" type="number" min="1" placeholder="250" defaultValue={initialForm.price} required />
        </label>

        <label>
          Location
          <input name="location" placeholder="Prishtine" defaultValue={initialForm.location} required />
        </label>

        <label>
          Condition
          <input name="condition" placeholder="Used" defaultValue={initialForm.condition} required />
        </label>

        <label>
          Seller type
          <select name="sellerType" defaultValue={initialForm.sellerType}>
            <option value="Individual">Individual</option>
            <option value="Business">Business</option>
            <option value="Owner">Owner</option>
          </select>
        </label>
      </div>

      <label>
        Description
        <textarea
          name="description"
          rows="4"
          placeholder="Describe the item, condition, and why someone should contact you."
          defaultValue={initialForm.description}
          required
        />
      </label>

      <button type="submit" className="primary-button" disabled={isSubmitting}>
        {isSubmitting ? 'Publishing...' : 'Publish Listing'}
      </button>
    </form>
  );
}
