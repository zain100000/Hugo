/**
 * ManageCoinPackages Component
 *
 * Provides an interface for managing coin packages within the admin panel.
 * Features include:
 * - Fetching coin packages from Redux store
 * - Searching coin packages by name
 * - Adding, editing, and deleting packages
 * - Status indicator for active/inactive packages
 * - Confirmation modal before deletion
 *
 * @component
 * @example
 * return (
 *   <ManageCoinPackages />
 * )
 */

import { useState, useEffect } from "react";
import "../../../styles/global.styles.css";
import "./Coin.package.css";
import { useDispatch, useSelector } from "react-redux";
import {
  getPackages,
  setPackages,
  deletePackage,
} from "../../../redux/slices/package.slice";
import Modal from "../../../utilities/Modal/Modal.utlity";
import { toast } from "react-hot-toast";
import InputField from "../../../utilities/InputField/InputField.utility";
import Button from "../../../utilities/Button/Button.utility";
import { useNavigate } from "react-router-dom";
import Loader from "../../../utilities/Loader/Loader.utility";

const ManageCoinPackages = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const packages = useSelector((state) => state.packages.packages);

  const [selectedPackage, setSelectedPackage] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [loadingAction, setLoadingAction] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      setLoading(true);
      dispatch(getPackages())
        .unwrap()
        .then(() => setLoading(false))
        .catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [dispatch, user?.id]);

  const filteredPackages = (Array.isArray(packages) ? packages : []).filter(
    (pkg) => pkg.name && pkg.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSearch = (e) => setSearch(e.target.value);

  const handleDeletePackage = (pkg) => {
    setSelectedPackage(pkg);
    setIsDeleteModalOpen(true);
  };

  const deletePackageHandler = async () => {
    setLoadingAction("DELETE");
    try {
      if (selectedPackage?._id) {
        // The Redux thunk will handle the API call
        const resultAction = await dispatch(deletePackage(selectedPackage._id));

        if (deletePackage.fulfilled.match(resultAction)) {
          toast.success("Package deleted successfully!");
          // Manually update Redux state to avoid re-fetching the entire list
          dispatch(
            setPackages(packages.filter((doc) => doc._id !== selectedPackage._id))
          );
        } else if (deletePackage.rejected.match(resultAction)) {
          // Handle rejection from the thunk
          const errorPayload = resultAction.payload;
          const errorMessage = errorPayload?.message || "Error while deleting package.";
          toast.error(errorMessage);
        }
      }
    } catch (err) {
      // Catch unexpected local errors (e.g., dispatch error)
      toast.error("An unexpected error occurred during deletion.");
    } finally {
      setLoadingAction(null);
      setIsDeleteModalOpen(false);
      setSelectedPackage(null);
    }
  };

  const sortPackages = (packages) => {
    const priorityOrder = ["Daily", "Weekly", "Monthly"];

    return [...packages].sort((a, b) => {
      // Check priority packages first
      const aPriority = priorityOrder.indexOf(a.name);
      const bPriority = priorityOrder.indexOf(b.name);

      if (aPriority !== -1 && bPriority !== -1) {
        return aPriority - bPriority; // Both are priority
      }
      if (aPriority !== -1) return -1; // a is priority, b is not
      if (bPriority !== -1) return 1; // b is priority, a is not

      // Both are custom → sort by coins (ascending)
      return (a.coins || 0) - (b.coins || 0);
    });
  };

  const handleEditPackage = (pkg) => {
    navigate(`/super-admin/coin-packages/update-coin-package/${pkg._id}`, {
      state: { pkg },
    });
  };

  const handleAddPackageNavigate = () => {
    navigate("/super-admin/coin-packages/add-coin-packages");
  };

  return (
    <section id="coin-packages">
      <div className="coin-packages-container">
        <h2 className="coin-packages-title">Coin Packages List</h2>
        <div className="coin-packages-header">
          <div className="mt-4">
            <InputField
              placeholder={"Search Packages"}
              type="text"
              editable={true}
              value={search}
              onChange={handleSearch}
              icon={<i className="fas fa-search"></i>}
              textColor={"#000"}
              width={300}
            />
          </div>
          <Button
            title="Package"
            width={150}
            onPress={handleAddPackageNavigate}
            icon={<i className="fas fa-plus-circle"></i>}
          />
        </div>

        <div className="table-responsive">
          {loading ? (
            <div className="loader-container">
              <Loader />
            </div>
          ) : filteredPackages.length > 0 ? (
            <table className="coin-packages-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Coins</th>
                  <th>Price</th>
                  <th>Currency</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortPackages(filteredPackages).map((pkg) => (
                  <tr key={pkg._id}>
                    <td>{pkg.name}</td>
                    <td>{pkg.coins}</td>
                    <td>PKR{pkg.price}</td>
                    <td>{pkg.currency}</td>
                    <td>
                      {pkg.isActive ? (
                        <span className="status-active">Active</span>
                      ) : (
                        <span className="status-inactive">Inactive</span>
                      )}
                    </td>
                    <td className="actions">
                      <button
                        className="action-btn edit-btn"
                        onClick={() => handleEditPackage(pkg)}
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button
                        className="action-btn delete-btn"
                        onClick={() => handleDeletePackage(pkg)}
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="no-packages-found">
              <div className="empty-content">
                <i className="fas fa-box-open"></i>
                <p>No Packages Found</p>
              </div>
            </div>
          )}
        </div>

        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          title={`Delete package`}
          loading={loadingAction === "DELETE"}
          buttons={[
            {
              label: "Delete",
              className: "danger-btn",
              onClick: deletePackageHandler,
              loading: loadingAction === "DELETE",
            },
          ]}
        >
          <p>Are you sure you want to delete this package?</p>
          <p className="text-muted">This action cannot be undone.</p>
        </Modal>
      </div>
    </section>
  );
};

export default ManageCoinPackages;