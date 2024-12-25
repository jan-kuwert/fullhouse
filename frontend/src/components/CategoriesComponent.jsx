import { Box, Chip } from '@mui/material';
import { PlusIcon, XIcon } from 'lucide-react';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { useSearch } from '../provider/SearchProvider';

//returns a block with 3 rows of all 10 trip categories as chips to select
//selected categories are stored in categories array via setCategories provided by parent
export default function CategoriesComponent({
  selectedCategories, //contains list of selected categories
  setSelectedCategories, //function to set selected categories
  selectedIcons, //contains list of selected category icons
  setSelectedIcons, //function to send category icons to parent
  bgWhite = false, // optional prop to set unselected chip background to white
}) {
  const chipStatusClass = ['category-chip', 'category-chip-seleceted']; //css classes that render chips selected or not
  const [categoryStatus, setCategoryStatus] = useState([]); //saves if a category is selected or not (saves the according css className)
  const [categoryHovered, setCategoryHovered] = useState([]);

  // all trip categories and their repective icons
  const { tripCategoriesArray } = useSearch();

  useEffect(() => {
    //set the status of all chips to selected or not based on selectedCategories
    //do it on every mount since otherwise the visual state is lost when comp is unmounted
    let statusTemp = [...categoryStatus];
    for (let i = 0; i < tripCategoriesArray.length; i++) {
      if (selectedCategories.includes(tripCategoriesArray[i][1])) {
        statusTemp[i] = chipStatusClass[1];
      } else {
        statusTemp[i] = chipStatusClass[0];
      }
    }
    setCategoryStatus(statusTemp);
  }, []);

  //called on click on a category chip and changes the style + adds/removes category from categories array
  const handleChipClick = (categoryIndex) => {
    const categoryName = tripCategoriesArray[categoryIndex][1];
    const statusTemp = [...categoryStatus];
    if (selectedCategories.includes(categoryName)) {
      const iconIndex = selectedCategories.indexOf(categoryName);
      setSelectedCategories(
        selectedCategories.filter((category) => category !== categoryName)
      );
      if (selectedIcons) {
        setSelectedIcons(
          selectedIcons.filter((item, index) => index !== iconIndex)
        );
      }
      statusTemp[categoryIndex] = chipStatusClass[0];
      setCategoryStatus(statusTemp);
    } else {
      setSelectedCategories([...selectedCategories, categoryName]);
      statusTemp[categoryIndex] = chipStatusClass[1];
      if (selectedIcons) {
        setSelectedIcons([
          ...selectedIcons,
          tripCategoriesArray[categoryIndex][0],
        ]);
      }
      setCategoryStatus(statusTemp);
    }
  };

  const handleHoveredCategory = (value, i) => {
    const hoveredTemp = []; //dont get the values from categoryHovered otherwise on fast hovers they stay true since react cant udpate fast enough
    hoveredTemp[i] = value;
    setCategoryHovered(hoveredTemp);
  };

  return (
    <Box className="-mr-2 w-fit p-4">
      <div className="mb-4 w-full">
        {/* make three rows since the 10 categories fit well into it like this */}
        {tripCategoriesArray.slice(0, 3).map((category, index) => (
          <Chip
            key={category[1]}
            icon={
              categoryHovered[index] ? (
                categoryStatus[index] == chipStatusClass[0] ? (
                  <PlusIcon />
                ) : (
                  <XIcon />
                )
              ) : (
                category[0]
              )
            }
            label={category[1]}
            onClick={() => handleChipClick(index)}
            onMouseEnter={() => handleHoveredCategory(true, index)}
            onMouseLeave={() => handleHoveredCategory(false, index)}
            className={
              bgWhite ? categoryStatus[index] + ' white' : categoryStatus[index]
            } //add white class if bgWhite is true so the chip background is white
          />
        ))}
      </div>
      <div className="mb-4 w-full">
        {tripCategoriesArray.slice(3, 6).map((category, index) => (
          <Chip
            key={category[1]}
            icon={
              categoryHovered[index + 3] ? (
                categoryStatus[index + 3] == chipStatusClass[0] ? (
                  <PlusIcon />
                ) : (
                  <XIcon />
                )
              ) : (
                category[0]
              )
            }
            label={category[1]}
            onClick={() => handleChipClick(index + 3)}
            onMouseEnter={() => handleHoveredCategory(true, index + 3)}
            onMouseLeave={() => handleHoveredCategory(false, index + 3)}
            className={
              bgWhite
                ? categoryStatus[index + 3] + ' white'
                : categoryStatus[index + 3]
            }
          />
        ))}
      </div>
      <div className="w-full">
        {tripCategoriesArray.slice(6, 10).map((category, index) => (
          <Chip
            key={category[1]}
            icon={
              categoryHovered[index + 6] ? (
                categoryStatus[index + 6] == chipStatusClass[0] ? (
                  <PlusIcon />
                ) : (
                  <XIcon />
                )
              ) : (
                category[0]
              )
            }
            label={category[1]}
            onClick={() => handleChipClick(index + 6)}
            onMouseEnter={() => handleHoveredCategory(true, index + 6)}
            onMouseLeave={() => handleHoveredCategory(false, index + 6)}
            className={
              bgWhite
                ? categoryStatus[index + 6] + ' white'
                : categoryStatus[index + 6]
            }
          />
        ))}
      </div>
    </Box>
  );
}

CategoriesComponent.propTypes = {
  selectedCategories: PropTypes.array.isRequired,
  setSelectedCategories: PropTypes.func.isRequired,
  selectedIcons: PropTypes.array,
  setSelectedIcons: PropTypes.func,
  bgWhite: PropTypes.bool,
};
