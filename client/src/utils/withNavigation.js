// src/utils/withNavigation.js
import { useNavigate, useLocation, useParams } from "react-router-dom";

/**
 * HOC to inject React Router v6 navigation hooks into class components.
 * Lets class components use this.props.navigate() safely.
 */
export function withNavigation(Component) {
  return function (props) {
    const navigate = useNavigate();
    const location = useLocation();
    const params = useParams();
    return (
      <Component
        {...props}
        navigate={navigate}
        location={location}
        params={params}
      />
    );
  };
}
