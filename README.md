# 🖼️ MoMA Gender Disparity Visualizations

This project provides a museum-style data storytelling interface to explore gender disparities in the museum collection. Each visualization is framed like an artwork, embedded into a larger interactive gallery experience.

**Group Members: Xiaonan Li, Molly Han**

---

## 📁 Project Structure

```
/                 ← Root with museum layout
├── /artwork_size/            ← Embedded visualization: Gender disparities in artwork size
├── /creation_date/           ← Embedded visualization: Gender disparities in creation dates
├── /department/              ← Embedded visualization: Gender differences across departments of artwork
├── /gap/                     ← Embedded visualization: Time lag in artwork acquisitions by gender
├── /medium/                  ← Embedded visualization: Gender differences in medium used
├── /puzzle/                  ← Embedded visualization: Average artworks acquired per artist by gender
├── MoMA_merged_final.csv     ← Dataset used in visualizations
├── index.html                ← Main interactive museum page that includes all visualizations
└── museum2.jpeg              ← Background image for the museum layout
```

---

## 🚀 How to Run Locally

No build tools or servers are required — you can run everything directly from your computer.

### 🧾 Steps:

1. **Download or clone the repo**
2. **Open `index.html` in your browser**
   - Go Live for `index.html`
3. **(Optional) Explore visualizations individually**
   - You can also open any `.html` file inside folders like `/gap/`, `/department/`, etc., to view that chart on its own.

   ✅ All internal visualizations and datasets are already linked correctly

---

## 🌐 View It Live

This project is also hosted via GitHub Pages:

Please access: https://xiashaoyixue.github.io/CS-441/

## 🎨 About the Visuals

Each visualization highlights a unique perspective on gender disparities within the museum's acquisition history. These visualizations are embedded into the main gallery-style interface (`index.html`) using <`iframe`>, allowing viewers to browse them as if walking through a physical exhibit.

- Visualizations are displayed as “artworks” using data-driven figures.
- The current `index.html` interface is functional but does not yet support interactions like zooming or clicking on individual visualizations — these enhancements will be added in the next milestone.
- All visualizations are modular and can be explored on their own by opening their respective HTML files directly.
- Some visualizations (such as the `puzzle` and `gap`) include partially implemented interactive elements that will be completed soon — for example, animated bubbles, timelines, and puzzle mechanics that reflect data evolution.
- The poem component is also planned as an interactive element and has not been embedded yet due to its unique requirements.
- Feedback from Milestone 3 primarily concerned technical challenges, and some of which have been addressed. Both team members are currently finalizing their thesis work and will finish them withint this week. While the visualizations may look somewhat ugly now, we will complete the remaining interactions and design polish within the coming week.

